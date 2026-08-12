#!/usr/bin/env node
import{createRequire}from'node:module';const require=createRequire(import.meta.url);
var Jc=Object.create;var Fr=Object.defineProperty;var Hc=Object.getOwnPropertyDescriptor;var Wc=Object.getOwnPropertyNames;var Qc=Object.getPrototypeOf,Zc=Object.prototype.hasOwnProperty;var It=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var _=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var el=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Wc(e))!Zc.call(n,r)&&r!==t&&Fr(n,r,{get:()=>e[r],enumerable:!(i=Hc(e,r))||i.enumerable});return n};var Br=(n,e,t)=>(t=n!=null?Jc(Qc(n)):{},el(e||!n||!n.__esModule?Fr(t,"default",{value:n,enumerable:!0}):t,n));var C=_(Y=>{"use strict";var Kn=Symbol.for("yaml.alias"),as=Symbol.for("yaml.document"),Ct=Symbol.for("yaml.map"),cs=Symbol.for("yaml.pair"),jn=Symbol.for("yaml.scalar"),Dt=Symbol.for("yaml.seq"),ce=Symbol.for("yaml.node.type"),Pl=n=>!!n&&typeof n=="object"&&n[ce]===Kn,ql=n=>!!n&&typeof n=="object"&&n[ce]===as,$l=n=>!!n&&typeof n=="object"&&n[ce]===Ct,Ml=n=>!!n&&typeof n=="object"&&n[ce]===cs,ls=n=>!!n&&typeof n=="object"&&n[ce]===jn,Ul=n=>!!n&&typeof n=="object"&&n[ce]===Dt;function ds(n){if(n&&typeof n=="object")switch(n[ce]){case Ct:case Dt:return!0}return!1}function Fl(n){if(n&&typeof n=="object")switch(n[ce]){case Kn:case Ct:case jn:case Dt:return!0}return!1}var Bl=n=>(ls(n)||ds(n))&&!!n.anchor;Y.ALIAS=Kn;Y.DOC=as;Y.MAP=Ct;Y.NODE_TYPE=ce;Y.PAIR=cs;Y.SCALAR=jn;Y.SEQ=Dt;Y.hasAnchor=Bl;Y.isAlias=Pl;Y.isCollection=ds;Y.isDocument=ql;Y.isMap=$l;Y.isNode=Fl;Y.isPair=Ml;Y.isScalar=ls;Y.isSeq=Ul});var He=_(Xn=>{"use strict";var F=C(),V=Symbol("break visit"),fs=Symbol("skip children"),se=Symbol("remove node");function Pt(n,e){let t=us(e);F.isDocument(n)?Pe(null,n.contents,t,Object.freeze([n]))===se&&(n.contents=null):Pe(null,n,t,Object.freeze([]))}Pt.BREAK=V;Pt.SKIP=fs;Pt.REMOVE=se;function Pe(n,e,t,i){let r=ps(n,e,t,i);if(F.isNode(r)||F.isPair(r))return hs(n,i,r),Pe(n,r,t,i);if(typeof r!="symbol"){if(F.isCollection(e)){i=Object.freeze(i.concat(e));for(let s=0;s<e.items.length;++s){let o=Pe(s,e.items[s],t,i);if(typeof o=="number")s=o-1;else{if(o===V)return V;o===se&&(e.items.splice(s,1),s-=1)}}}else if(F.isPair(e)){i=Object.freeze(i.concat(e));let s=Pe("key",e.key,t,i);if(s===V)return V;s===se&&(e.key=null);let o=Pe("value",e.value,t,i);if(o===V)return V;o===se&&(e.value=null)}}return r}async function qt(n,e){let t=us(e);F.isDocument(n)?await qe(null,n.contents,t,Object.freeze([n]))===se&&(n.contents=null):await qe(null,n,t,Object.freeze([]))}qt.BREAK=V;qt.SKIP=fs;qt.REMOVE=se;async function qe(n,e,t,i){let r=await ps(n,e,t,i);if(F.isNode(r)||F.isPair(r))return hs(n,i,r),qe(n,r,t,i);if(typeof r!="symbol"){if(F.isCollection(e)){i=Object.freeze(i.concat(e));for(let s=0;s<e.items.length;++s){let o=await qe(s,e.items[s],t,i);if(typeof o=="number")s=o-1;else{if(o===V)return V;o===se&&(e.items.splice(s,1),s-=1)}}}else if(F.isPair(e)){i=Object.freeze(i.concat(e));let s=await qe("key",e.key,t,i);if(s===V)return V;s===se&&(e.key=null);let o=await qe("value",e.value,t,i);if(o===V)return V;o===se&&(e.value=null)}}return r}function us(n){return typeof n=="object"&&(n.Collection||n.Node||n.Value)?Object.assign({Alias:n.Node,Map:n.Node,Scalar:n.Node,Seq:n.Node},n.Value&&{Map:n.Value,Scalar:n.Value,Seq:n.Value},n.Collection&&{Map:n.Collection,Seq:n.Collection},n):n}function ps(n,e,t,i){if(typeof t=="function")return t(n,e,i);if(F.isMap(e))return t.Map?.(n,e,i);if(F.isSeq(e))return t.Seq?.(n,e,i);if(F.isPair(e))return t.Pair?.(n,e,i);if(F.isScalar(e))return t.Scalar?.(n,e,i);if(F.isAlias(e))return t.Alias?.(n,e,i)}function hs(n,e,t){let i=e[e.length-1];if(F.isCollection(i))i.items[n]=t;else if(F.isPair(i))n==="key"?i.key=t:i.value=t;else if(F.isDocument(i))i.contents=t;else{let r=F.isAlias(i)?"alias":"scalar";throw new Error(`Cannot replace node with ${r} parent`)}}Xn.visit=Pt;Xn.visitAsync=qt});var Yn=_(gs=>{"use strict";var ms=C(),Kl=He(),jl={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},Xl=n=>n.replace(/[!,[\]{}]/g,e=>jl[e]),We=class n{constructor(e,t){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},n.defaultYaml,e),this.tags=Object.assign({},n.defaultTags,t)}clone(){let e=new n(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){let e=new n(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:n.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},n.defaultTags);break}return e}add(e,t){this.atNextDocument&&(this.yaml={explicit:n.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},n.defaultTags),this.atNextDocument=!1);let i=e.trim().split(/[ \t]+/),r=i.shift();switch(r){case"%TAG":{if(i.length!==2&&(t(0,"%TAG directive should contain exactly two parts"),i.length<2))return!1;let[s,o]=i;return this.tags[s]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,i.length!==1)return t(0,"%YAML directive should contain exactly one part"),!1;let[s]=i;if(s==="1.1"||s==="1.2")return this.yaml.version=s,!0;{let o=/^\d+\.\d+$/.test(s);return t(6,`Unsupported YAML version ${s}`,o),!1}}default:return t(0,`Unknown directive ${r}`,!0),!1}}tagName(e,t){if(e==="!")return"!";if(e[0]!=="!")return t(`Not a valid tag: ${e}`),null;if(e[1]==="<"){let o=e.slice(2,-1);return o==="!"||o==="!!"?(t(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&t("Verbatim tags must end with a >"),o)}let[,i,r]=e.match(/^(.*!)([^!]*)$/s);r||t(`The ${e} tag has no suffix`);let s=this.tags[i];if(s)try{return s+decodeURIComponent(r)}catch(o){return t(String(o)),null}return i==="!"?e:(t(`Could not resolve tag: ${e}`),null)}tagString(e){for(let[t,i]of Object.entries(this.tags))if(e.startsWith(i))return t+Xl(e.substring(i.length));return e[0]==="!"?e:`!<${e}>`}toString(e){let t=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],i=Object.entries(this.tags),r;if(e&&i.length>0&&ms.isNode(e.contents)){let s={};Kl.visit(e.contents,(o,a)=>{ms.isNode(a)&&a.tag&&(s[a.tag]=!0)}),r=Object.keys(s)}else r=[];for(let[s,o]of i)s==="!!"&&o==="tag:yaml.org,2002:"||(!e||r.some(a=>a.startsWith(o)))&&t.push(`%TAG ${s} ${o}`);return t.join(`
`)}};We.defaultYaml={explicit:!1,version:"1.2"};We.defaultTags={"!!":"tag:yaml.org,2002:"};gs.Directives=We});var $t=_(Qe=>{"use strict";var ys=C(),Yl=He();function zl(n){if(/[\x00-\x19\s,[\]{}]/.test(n)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;throw new Error(t)}return!0}function bs(n){let e=new Set;return Yl.visit(n,{Value(t,i){i.anchor&&e.add(i.anchor)}}),e}function Es(n,e){for(let t=1;;++t){let i=`${n}${t}`;if(!e.has(i))return i}}function Vl(n,e){let t=[],i=new Map,r=null;return{onAnchor:s=>{t.push(s),r??(r=bs(n));let o=Es(e,r);return r.add(o),o},setAnchors:()=>{for(let s of t){let o=i.get(s);if(typeof o=="object"&&o.anchor&&(ys.isScalar(o.node)||ys.isCollection(o.node)))o.node.anchor=o.anchor;else{let a=new Error("Failed to resolve repeated object (this should not happen)");throw a.source=s,a}}},sourceObjects:i}}Qe.anchorIsValid=zl;Qe.anchorNames=bs;Qe.createNodeAnchors=Vl;Qe.findNewAnchor=Es});var zn=_(Ts=>{"use strict";function Ze(n,e,t,i){if(i&&typeof i=="object")if(Array.isArray(i))for(let r=0,s=i.length;r<s;++r){let o=i[r],a=Ze(n,i,String(r),o);a===void 0?delete i[r]:a!==o&&(i[r]=a)}else if(i instanceof Map)for(let r of Array.from(i.keys())){let s=i.get(r),o=Ze(n,i,r,s);o===void 0?i.delete(r):o!==s&&i.set(r,o)}else if(i instanceof Set)for(let r of Array.from(i)){let s=Ze(n,i,r,r);s===void 0?i.delete(r):s!==r&&(i.delete(r),i.add(s))}else for(let[r,s]of Object.entries(i)){let o=Ze(n,i,r,s);o===void 0?delete i[r]:o!==s&&(i[r]=o)}return n.call(e,t,i)}Ts.applyReviver=Ze});var fe=_(Ns=>{"use strict";var Gl=C();function _s(n,e,t){if(Array.isArray(n))return n.map((i,r)=>_s(i,String(r),t));if(n&&typeof n.toJSON=="function"){if(!t||!Gl.hasAnchor(n))return n.toJSON(e,t);let i={aliasCount:0,count:1,res:void 0};t.anchors.set(n,i),t.onCreate=s=>{i.res=s,delete t.onCreate};let r=n.toJSON(e,t);return t.onCreate&&t.onCreate(r),r}return typeof n=="bigint"&&!t?.keep?Number(n):n}Ns.toJS=_s});var Mt=_(ws=>{"use strict";var Jl=zn(),Ss=C(),Hl=fe(),Vn=class{constructor(e){Object.defineProperty(this,Ss.NODE_TYPE,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:i,onAnchor:r,reviver:s}={}){if(!Ss.isDocument(e))throw new TypeError("A document argument is required");let o={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof i=="number"?i:100},a=Hl.toJS(this,"",o);if(typeof r=="function")for(let{count:c,res:l}of o.anchors.values())r(l,c);return typeof s=="function"?Jl.applyReviver(s,{"":a},"",a):a}};ws.NodeBase=Vn});var et=_(vs=>{"use strict";var Wl=$t(),Ql=He(),$e=C(),Zl=Mt(),ed=fe(),Gn=class extends Zl.NodeBase{constructor(e){super($e.ALIAS),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,t){if(t?.maxAliasCount===0)throw new ReferenceError("Alias resolution is disabled");let i;t?.aliasResolveCache?i=t.aliasResolveCache:(i=[],Ql.visit(e,{Node:(s,o)=>{($e.isAlias(o)||$e.hasAnchor(o))&&i.push(o)}}),t&&(t.aliasResolveCache=i));let r;for(let s of i){if(s===this)break;s.anchor===this.source&&(r=s)}return r}toJSON(e,t){if(!t)return{source:this.source};let{anchors:i,doc:r,maxAliasCount:s}=t,o=this.resolve(r,t);if(!o){let c=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(c)}let a=i.get(o);if(a||(ed.toJS(o,null,t),a=i.get(o)),a?.res===void 0){let c="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(c)}if(s>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=Ut(r,o,i)),a.count*a.aliasCount>s)){let c="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(c)}return a.res}toString(e,t,i){let r=`*${this.source}`;if(e){if(Wl.anchorIsValid(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let s=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(s)}if(e.implicitKey)return`${r} `}return r}};function Ut(n,e,t){if($e.isAlias(e)){let i=e.resolve(n),r=t&&i&&t.get(i);return r?r.count*r.aliasCount:0}else if($e.isCollection(e)){let i=0;for(let r of e.items){let s=Ut(n,r,t);s>i&&(i=s)}return i}else if($e.isPair(e)){let i=Ut(n,e.key,t),r=Ut(n,e.value,t);return Math.max(i,r)}return 1}vs.Alias=Gn});var M=_(Jn=>{"use strict";var td=C(),nd=Mt(),id=fe(),rd=n=>!n||typeof n!="function"&&typeof n!="object",ue=class extends nd.NodeBase{constructor(e){super(td.SCALAR),this.value=e}toJSON(e,t){return t?.keep?this.value:id.toJS(this.value,e,t)}toString(){return String(this.value)}};ue.BLOCK_FOLDED="BLOCK_FOLDED";ue.BLOCK_LITERAL="BLOCK_LITERAL";ue.PLAIN="PLAIN";ue.QUOTE_DOUBLE="QUOTE_DOUBLE";ue.QUOTE_SINGLE="QUOTE_SINGLE";Jn.Scalar=ue;Jn.isScalarValue=rd});var tt=_(As=>{"use strict";var sd=et(),Ne=C(),ks=M(),od="tag:yaml.org,2002:";function ad(n,e,t){if(e){let i=t.filter(s=>s.tag===e),r=i.find(s=>!s.format)??i[0];if(!r)throw new Error(`Tag ${e} not found`);return r}return t.find(i=>i.identify?.(n)&&!i.format)}function cd(n,e,t){if(Ne.isDocument(n)&&(n=n.contents),Ne.isNode(n))return n;if(Ne.isPair(n)){let d=t.schema[Ne.MAP].createNode?.(t.schema,null,t);return d.items.push(n),d}(n instanceof String||n instanceof Number||n instanceof Boolean||typeof BigInt<"u"&&n instanceof BigInt)&&(n=n.valueOf());let{aliasDuplicateObjects:i,onAnchor:r,onTagObj:s,schema:o,sourceObjects:a}=t,c;if(i&&n&&typeof n=="object"){if(c=a.get(n),c)return c.anchor??(c.anchor=r(n)),new sd.Alias(c.anchor);c={anchor:null,node:null},a.set(n,c)}e?.startsWith("!!")&&(e=od+e.slice(2));let l=ad(n,e,o.tags);if(!l){if(n&&typeof n.toJSON=="function"&&(n=n.toJSON()),!n||typeof n!="object"){let d=new ks.Scalar(n);return c&&(c.node=d),d}l=n instanceof Map?o[Ne.MAP]:Symbol.iterator in Object(n)?o[Ne.SEQ]:o[Ne.MAP]}s&&(s(l),delete t.onTagObj);let u=l?.createNode?l.createNode(t.schema,n,t):typeof l?.nodeClass?.from=="function"?l.nodeClass.from(t.schema,n,t):new ks.Scalar(n);return e?u.tag=e:l.default||(u.tag=l.tag),c&&(c.node=u),u}As.createNode=cd});var Bt=_(Ft=>{"use strict";var ld=tt(),oe=C(),dd=Mt();function Hn(n,e,t){let i=t;for(let r=e.length-1;r>=0;--r){let s=e[r];if(typeof s=="number"&&Number.isInteger(s)&&s>=0){let o=[];o[s]=i,i=o}else i=new Map([[s,i]])}return ld.createNode(i,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:n,sourceObjects:new Map})}var Ls=n=>n==null||typeof n=="object"&&!!n[Symbol.iterator]().next().done,Wn=class extends dd.NodeBase{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(i=>oe.isNode(i)||oe.isPair(i)?i.clone(e):i),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(Ls(e))this.add(t);else{let[i,...r]=e,s=this.get(i,!0);if(oe.isCollection(s))s.addIn(r,t);else if(s===void 0&&this.schema)this.set(i,Hn(this.schema,r,t));else throw new Error(`Expected YAML collection at ${i}. Remaining path: ${r}`)}}deleteIn(e){let[t,...i]=e;if(i.length===0)return this.delete(t);let r=this.get(t,!0);if(oe.isCollection(r))return r.deleteIn(i);throw new Error(`Expected YAML collection at ${t}. Remaining path: ${i}`)}getIn(e,t){let[i,...r]=e,s=this.get(i,!0);return r.length===0?!t&&oe.isScalar(s)?s.value:s:oe.isCollection(s)?s.getIn(r,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!oe.isPair(t))return!1;let i=t.value;return i==null||e&&oe.isScalar(i)&&i.value==null&&!i.commentBefore&&!i.comment&&!i.tag})}hasIn(e){let[t,...i]=e;if(i.length===0)return this.has(t);let r=this.get(t,!0);return oe.isCollection(r)?r.hasIn(i):!1}setIn(e,t){let[i,...r]=e;if(r.length===0)this.set(i,t);else{let s=this.get(i,!0);if(oe.isCollection(s))s.setIn(r,t);else if(s===void 0&&this.schema)this.set(i,Hn(this.schema,r,t));else throw new Error(`Expected YAML collection at ${i}. Remaining path: ${r}`)}}};Ft.Collection=Wn;Ft.collectionFromPath=Hn;Ft.isEmptyPath=Ls});var nt=_(Kt=>{"use strict";var fd=n=>n.replace(/^(?!$)(?: $)?/gm,"#");function Qn(n,e){return/^\n+$/.test(n)?n.substring(1):e?n.replace(/^(?! *$)/gm,e):n}var ud=(n,e,t)=>n.endsWith(`
`)?Qn(t,e):t.includes(`
`)?`
`+Qn(t,e):(n.endsWith(" ")?"":" ")+t;Kt.indentComment=Qn;Kt.lineComment=ud;Kt.stringifyComment=fd});var Is=_(it=>{"use strict";var pd="flow",Zn="block",jt="quoted";function hd(n,e,t="flow",{indentAtStart:i,lineWidth:r=80,minContentWidth:s=20,onFold:o,onOverflow:a}={}){if(!r||r<0)return n;r<s&&(s=0);let c=Math.max(1+s,1+r-e.length);if(n.length<=c)return n;let l=[],u={},d=r-e.length;typeof i=="number"&&(i>r-Math.max(2,s)?l.push(0):d=r-i);let f,h,g=!1,p=-1,y=-1,T=-1;t===Zn&&(p=Os(n,p,e.length),p!==-1&&(d=p+c));for(let S;S=n[p+=1];){if(t===jt&&S==="\\"){switch(y=p,n[p+1]){case"x":p+=3;break;case"u":p+=5;break;case"U":p+=9;break;default:p+=1}T=p}if(S===`
`)t===Zn&&(p=Os(n,p,e.length)),d=p+e.length+c,f=void 0;else{if(S===" "&&h&&h!==" "&&h!==`
`&&h!=="	"){let w=n[p+1];w&&w!==" "&&w!==`
`&&w!=="	"&&(f=p)}if(p>=d)if(f)l.push(f),d=f+c,f=void 0;else if(t===jt){for(;h===" "||h==="	";)h=S,S=n[p+=1],g=!0;let w=p>T+1?p-2:y-1;if(u[w])return n;l.push(w),u[w]=!0,d=w+c,f=void 0}else g=!0}h=S}if(g&&a&&a(),l.length===0)return n;o&&o();let E=n.slice(0,l[0]);for(let S=0;S<l.length;++S){let w=l[S],k=l[S+1]||n.length;w===0?E=`
${e}${n.slice(0,k)}`:(t===jt&&u[w]&&(E+=`${n[w]}\\`),E+=`
${e}${n.slice(w+1,k)}`)}return E}function Os(n,e,t){let i=e,r=e+1,s=n[r];for(;s===" "||s==="	";)if(e<r+t)s=n[++e];else{do s=n[++e];while(s&&s!==`
`);i=e,r=e+1,s=n[r]}return i}it.FOLD_BLOCK=Zn;it.FOLD_FLOW=pd;it.FOLD_QUOTED=jt;it.foldFlowLines=hd});var st=_(Rs=>{"use strict";var ee=M(),pe=Is(),Yt=(n,e)=>({indentAtStart:e?n.indent.length:n.indentAtStart,lineWidth:n.options.lineWidth,minContentWidth:n.options.minContentWidth}),zt=n=>/^(%|---|\.\.\.)/m.test(n);function md(n,e,t){if(!e||e<0)return!1;let i=e-t,r=n.length;if(r<=i)return!1;for(let s=0,o=0;s<r;++s)if(n[s]===`
`){if(s-o>i)return!0;if(o=s+1,r-o<=i)return!1}return!0}function rt(n,e){let t=JSON.stringify(n);if(e.options.doubleQuotedAsJSON)return t;let{implicitKey:i}=e,r=e.options.doubleQuotedMinMultiLineLength,s=e.indent||(zt(n)?"  ":""),o="",a=0;for(let c=0,l=t[c];l;l=t[++c])if(l===" "&&t[c+1]==="\\"&&t[c+2]==="n"&&(o+=t.slice(a,c)+"\\ ",c+=1,a=c,l="\\"),l==="\\")switch(t[c+1]){case"u":{o+=t.slice(a,c);let u=t.substr(c+2,4);switch(u){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:u.substr(0,2)==="00"?o+="\\x"+u.substr(2):o+=t.substr(c,6)}c+=5,a=c+1}break;case"n":if(i||t[c+2]==='"'||t.length<r)c+=1;else{for(o+=t.slice(a,c)+`

`;t[c+2]==="\\"&&t[c+3]==="n"&&t[c+4]!=='"';)o+=`
`,c+=2;o+=s,t[c+2]===" "&&(o+="\\"),c+=1,a=c+1}break;default:c+=1}return o=a?o+t.slice(a):t,i?o:pe.foldFlowLines(o,s,pe.FOLD_QUOTED,Yt(e,!1))}function ei(n,e){if(e.options.singleQuote===!1||e.implicitKey&&n.includes(`
`)||/[ \t]\n|\n[ \t]/.test(n))return rt(n,e);let t=e.indent||(zt(n)?"  ":""),i="'"+n.replace(/'/g,"''").replace(/\n+/g,`$&
${t}`)+"'";return e.implicitKey?i:pe.foldFlowLines(i,t,pe.FOLD_FLOW,Yt(e,!1))}function Me(n,e){let{singleQuote:t}=e.options,i;if(t===!1)i=rt;else{let r=n.includes('"'),s=n.includes("'");r&&!s?i=ei:s&&!r?i=rt:i=t?ei:rt}return i(n,e)}var ti;try{ti=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{ti=/\n+(?!\n|$)/g}function Xt({comment:n,type:e,value:t},i,r,s){let{blockQuote:o,commentString:a,lineWidth:c}=i.options;if(!o||/\n[\t ]+$/.test(t))return Me(t,i);let l=i.indent||(i.forceBlockIndent||zt(t)?"  ":""),u=o==="literal"?!0:o==="folded"||e===ee.Scalar.BLOCK_FOLDED?!1:e===ee.Scalar.BLOCK_LITERAL?!0:!md(t,c,l.length);if(!t)return u?`|
`:`>
`;let d,f;for(f=t.length;f>0;--f){let k=t[f-1];if(k!==`
`&&k!=="	"&&k!==" ")break}let h=t.substring(f),g=h.indexOf(`
`);g===-1?d="-":t===h||g!==h.length-1?(d="+",s&&s()):d="",h&&(t=t.slice(0,-h.length),h[h.length-1]===`
`&&(h=h.slice(0,-1)),h=h.replace(ti,`$&${l}`));let p=!1,y,T=-1;for(y=0;y<t.length;++y){let k=t[y];if(k===" ")p=!0;else if(k===`
`)T=y;else break}let E=t.substring(0,T<y?T+1:y);E&&(t=t.substring(E.length),E=E.replace(/\n+/g,`$&${l}`));let w=(p?l?"2":"1":"")+d;if(n&&(w+=" "+a(n.replace(/ ?[\r\n]+/g," ")),r&&r()),!u){let k=t.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${l}`),v=!1,N=Yt(i,!0);o!=="folded"&&e!==ee.Scalar.BLOCK_FOLDED&&(N.onOverflow=()=>{v=!0});let b=pe.foldFlowLines(`${E}${k}${h}`,l,pe.FOLD_BLOCK,N);if(!v)return`>${w}
${l}${b}`}return t=t.replace(/\n+/g,`$&${l}`),`|${w}
${l}${E}${t}${h}`}function gd(n,e,t,i){let{type:r,value:s}=n,{actualString:o,implicitKey:a,indent:c,indentStep:l,inFlow:u}=e;if(a&&s.includes(`
`)||u&&/[[\]{},]/.test(s))return Me(s,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(s))return a||u||!s.includes(`
`)?Me(s,e):Xt(n,e,t,i);if(!a&&!u&&r!==ee.Scalar.PLAIN&&s.includes(`
`))return Xt(n,e,t,i);if(zt(s)){if(c==="")return e.forceBlockIndent=!0,Xt(n,e,t,i);if(a&&c===l)return Me(s,e)}let d=s.replace(/\n+/g,`$&
${c}`);if(o){let f=p=>p.default&&p.tag!=="tag:yaml.org,2002:str"&&p.test?.test(d),{compat:h,tags:g}=e.doc.schema;if(g.some(f)||h?.some(f))return Me(s,e)}return a?d:pe.foldFlowLines(d,c,pe.FOLD_FLOW,Yt(e,!1))}function yd(n,e,t,i){let{implicitKey:r,inFlow:s}=e,o=typeof n.value=="string"?n:Object.assign({},n,{value:String(n.value)}),{type:a}=n;a!==ee.Scalar.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(a=ee.Scalar.QUOTE_DOUBLE);let c=u=>{switch(u){case ee.Scalar.BLOCK_FOLDED:case ee.Scalar.BLOCK_LITERAL:return r||s?Me(o.value,e):Xt(o,e,t,i);case ee.Scalar.QUOTE_DOUBLE:return rt(o.value,e);case ee.Scalar.QUOTE_SINGLE:return ei(o.value,e);case ee.Scalar.PLAIN:return gd(o,e,t,i);default:return null}},l=c(a);if(l===null){let{defaultKeyType:u,defaultStringType:d}=e.options,f=r&&u||d;if(l=c(f),l===null)throw new Error(`Unsupported default string type ${f}`)}return l}Rs.stringifyString=yd});var ot=_(ni=>{"use strict";var bd=$t(),he=C(),Ed=nt(),Td=st();function _d(n,e){let t=Object.assign({blockQuote:!0,commentString:Ed.stringifyComment,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:"true",verifyAliasOrder:!0},n.schema.toStringOptions,e),i;switch(t.collectionStyle){case"block":i=!1;break;case"flow":i=!0;break;default:i=null}return{anchors:new Set,doc:n,flowCollectionPadding:t.flowCollectionPadding?" ":"",indent:"",indentStep:typeof t.indent=="number"?" ".repeat(t.indent):"  ",inFlow:i,options:t}}function Nd(n,e){if(e.tag){let r=n.filter(s=>s.tag===e.tag);if(r.length>0)return r.find(s=>s.format===e.format)??r[0]}let t,i;if(he.isScalar(e)){i=e.value;let r=n.filter(s=>s.identify?.(i));if(r.length>1){let s=r.filter(o=>o.test);s.length>0&&(r=s)}t=r.find(s=>s.format===e.format)??r.find(s=>!s.format)}else i=e,t=n.find(r=>r.nodeClass&&i instanceof r.nodeClass);if(!t){let r=i?.constructor?.name??(i===null?"null":typeof i);throw new Error(`Tag not resolved for ${r} value`)}return t}function Sd(n,e,{anchors:t,doc:i}){if(!i.directives)return"";let r=[],s=(he.isScalar(n)||he.isCollection(n))&&n.anchor;s&&bd.anchorIsValid(s)&&(t.add(s),r.push(`&${s}`));let o=n.tag??(e.default?null:e.tag);return o&&r.push(i.directives.tagString(o)),r.join(" ")}function wd(n,e,t,i){if(he.isPair(n))return n.toString(e,t,i);if(he.isAlias(n)){if(e.doc.directives)return n.toString(e);if(e.resolvedAliases?.has(n))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(n):e.resolvedAliases=new Set([n]),n=n.resolve(e.doc)}let r,s=he.isNode(n)?n:e.doc.createNode(n,{onTagObj:c=>r=c});r??(r=Nd(e.doc.schema.tags,s));let o=Sd(s,r,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);let a=typeof r.stringify=="function"?r.stringify(s,e,t,i):he.isScalar(s)?Td.stringifyString(s,e,t,i):s.toString(e,t,i);return o?he.isScalar(s)||a[0]==="{"||a[0]==="["?`${o} ${a}`:`${o}
${e.indent}${a}`:a}ni.createStringifyContext=_d;ni.stringify=wd});var Ps=_(Ds=>{"use strict";var le=C(),xs=M(),Cs=ot(),at=nt();function vd({key:n,value:e},t,i,r){let{allNullValues:s,doc:o,indent:a,indentStep:c,options:{commentString:l,indentSeq:u,simpleKeys:d}}=t,f=le.isNode(n)&&n.comment||null;if(d){if(f)throw new Error("With simple keys, key nodes cannot have comments");if(le.isCollection(n)||!le.isNode(n)&&typeof n=="object"){let N="With simple keys, collection cannot be used as a key value";throw new Error(N)}}let h=!d&&(!n||f&&e==null&&!t.inFlow||le.isCollection(n)||(le.isScalar(n)?n.type===xs.Scalar.BLOCK_FOLDED||n.type===xs.Scalar.BLOCK_LITERAL:typeof n=="object"));t=Object.assign({},t,{allNullValues:!1,implicitKey:!h&&(d||!s),indent:a+c});let g=!1,p=!1,y=Cs.stringify(n,t,()=>g=!0,()=>p=!0);if(!h&&!t.inFlow&&y.length>1024){if(d)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");h=!0}if(t.inFlow){if(s||e==null)return g&&i&&i(),y===""?"?":h?`? ${y}`:y}else if(s&&!d||e==null&&h)return y=`? ${y}`,f&&!g?y+=at.lineComment(y,t.indent,l(f)):p&&r&&r(),y;g&&(f=null),h?(f&&(y+=at.lineComment(y,t.indent,l(f))),y=`? ${y}
${a}:`):(y=`${y}:`,f&&(y+=at.lineComment(y,t.indent,l(f))));let T,E,S;le.isNode(e)?(T=!!e.spaceBefore,E=e.commentBefore,S=e.comment):(T=!1,E=null,S=null,e&&typeof e=="object"&&(e=o.createNode(e))),t.implicitKey=!1,!h&&!f&&le.isScalar(e)&&(t.indentAtStart=y.length+1),p=!1,!u&&c.length>=2&&!t.inFlow&&!h&&le.isSeq(e)&&!e.flow&&!e.tag&&!e.anchor&&(t.indent=t.indent.substring(2));let w=!1,k=Cs.stringify(e,t,()=>w=!0,()=>p=!0),v=" ";if(f||T||E){if(v=T?`
`:"",E){let N=l(E);v+=`
${at.indentComment(N,t.indent)}`}k===""&&!t.inFlow?v===`
`&&S&&(v=`

`):v+=`
${t.indent}`}else if(!h&&le.isCollection(e)){let N=k[0],b=k.indexOf(`
`),O=b!==-1,J=t.inFlow??e.flow??e.items.length===0;if(O||!J){let B=!1;if(O&&(N==="&"||N==="!")){let q=k.indexOf(" ");N==="&"&&q!==-1&&q<b&&k[q+1]==="!"&&(q=k.indexOf(" ",q+1)),(q===-1||b<q)&&(B=!0)}B||(v=`
${t.indent}`)}}else(k===""||k[0]===`
`)&&(v="");return y+=v+k,t.inFlow?w&&i&&i():S&&!w?y+=at.lineComment(y,t.indent,l(S)):p&&r&&r(),y}Ds.stringifyPair=vd});var ri=_(ii=>{"use strict";var qs=It("process");function kd(n,...e){n==="debug"&&console.log(...e)}function Ad(n,e){(n==="debug"||n==="warn")&&(typeof qs.emitWarning=="function"?qs.emitWarning(e):console.warn(e))}ii.debug=kd;ii.warn=Ad});var Wt=_(Ht=>{"use strict";var Jt=C(),$s=M(),Vt="<<",Gt={identify:n=>n===Vt||typeof n=="symbol"&&n.description===Vt,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new $s.Scalar(Symbol(Vt)),{addToJSMap:Ms}),stringify:()=>Vt},Ld=(n,e)=>(Gt.identify(e)||Jt.isScalar(e)&&(!e.type||e.type===$s.Scalar.PLAIN)&&Gt.identify(e.value))&&n?.doc.schema.tags.some(t=>t.tag===Gt.tag&&t.default);function Ms(n,e,t){let i=Us(n,t);if(Jt.isSeq(i))for(let r of i.items)si(n,e,r);else if(Array.isArray(i))for(let r of i)si(n,e,r);else si(n,e,i)}function si(n,e,t){let i=Us(n,t);if(!Jt.isMap(i))throw new Error("Merge sources must be maps or map aliases");let r=i.toJSON(null,n,Map);for(let[s,o]of r)e instanceof Map?e.has(s)||e.set(s,o):e instanceof Set?e.add(s):Object.prototype.hasOwnProperty.call(e,s)||Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function Us(n,e){return n&&Jt.isAlias(e)?e.resolve(n.doc,n):e}Ht.addMergeToJSMap=Ms;Ht.isMergeKey=Ld;Ht.merge=Gt});var ai=_(Ks=>{"use strict";var Od=ri(),Fs=Wt(),Id=ot(),Bs=C(),oi=fe();function Rd(n,e,{key:t,value:i}){if(Bs.isNode(t)&&t.addToJSMap)t.addToJSMap(n,e,i);else if(Fs.isMergeKey(n,t))Fs.addMergeToJSMap(n,e,i);else{let r=oi.toJS(t,"",n);if(e instanceof Map)e.set(r,oi.toJS(i,r,n));else if(e instanceof Set)e.add(r);else{let s=xd(t,r,n),o=oi.toJS(i,s,n);s in e?Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[s]=o}}return e}function xd(n,e,t){if(e===null)return"";if(typeof e!="object")return String(e);if(Bs.isNode(n)&&t?.doc){let i=Id.createStringifyContext(t.doc,{});i.anchors=new Set;for(let s of t.anchors.keys())i.anchors.add(s.anchor);i.inFlow=!0,i.inStringifyKey=!0;let r=n.toString(i);if(!t.mapKeyWarned){let s=JSON.stringify(r);s.length>40&&(s=s.substring(0,36)+'..."'),Od.warn(t.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${s}. Set mapAsMap: true to use object keys.`),t.mapKeyWarned=!0}return r}return JSON.stringify(e)}Ks.addPairToJSMap=Rd});var me=_(ci=>{"use strict";var js=tt(),Cd=Ps(),Dd=ai(),Qt=C();function Pd(n,e,t){let i=js.createNode(n,void 0,t),r=js.createNode(e,void 0,t);return new Zt(i,r)}var Zt=class n{constructor(e,t=null){Object.defineProperty(this,Qt.NODE_TYPE,{value:Qt.PAIR}),this.key=e,this.value=t}clone(e){let{key:t,value:i}=this;return Qt.isNode(t)&&(t=t.clone(e)),Qt.isNode(i)&&(i=i.clone(e)),new n(t,i)}toJSON(e,t){let i=t?.mapAsMap?new Map:{};return Dd.addPairToJSMap(t,i,this)}toString(e,t,i){return e?.doc?Cd.stringifyPair(this,e,t,i):JSON.stringify(this)}};ci.Pair=Zt;ci.createPair=Pd});var li=_(Ys=>{"use strict";var Se=C(),Xs=ot(),en=nt();function qd(n,e,t){return(e.inFlow??n.flow?Md:$d)(n,e,t)}function $d({comment:n,items:e},t,{blockItemPrefix:i,flowChars:r,itemIndent:s,onChompKeep:o,onComment:a}){let{indent:c,options:{commentString:l}}=t,u=Object.assign({},t,{indent:s,type:null}),d=!1,f=[];for(let g=0;g<e.length;++g){let p=e[g],y=null;if(Se.isNode(p))!d&&p.spaceBefore&&f.push(""),tn(t,f,p.commentBefore,d),p.comment&&(y=p.comment);else if(Se.isPair(p)){let E=Se.isNode(p.key)?p.key:null;E&&(!d&&E.spaceBefore&&f.push(""),tn(t,f,E.commentBefore,d))}d=!1;let T=Xs.stringify(p,u,()=>y=null,()=>d=!0);y&&(T+=en.lineComment(T,s,l(y))),d&&y&&(d=!1),f.push(i+T)}let h;if(f.length===0)h=r.start+r.end;else{h=f[0];for(let g=1;g<f.length;++g){let p=f[g];h+=p?`
${c}${p}`:`
`}}return n?(h+=`
`+en.indentComment(l(n),c),a&&a()):d&&o&&o(),h}function Md({items:n},e,{flowChars:t,itemIndent:i}){let{indent:r,indentStep:s,flowCollectionPadding:o,options:{commentString:a}}=e;i+=s;let c=Object.assign({},e,{indent:i,inFlow:!0,type:null}),l=!1,u=0,d=[];for(let g=0;g<n.length;++g){let p=n[g],y=null;if(Se.isNode(p))p.spaceBefore&&d.push(""),tn(e,d,p.commentBefore,!1),p.comment&&(y=p.comment);else if(Se.isPair(p)){let E=Se.isNode(p.key)?p.key:null;E&&(E.spaceBefore&&d.push(""),tn(e,d,E.commentBefore,!1),E.comment&&(l=!0));let S=Se.isNode(p.value)?p.value:null;S?(S.comment&&(y=S.comment),S.commentBefore&&(l=!0)):p.value==null&&E?.comment&&(y=E.comment)}y&&(l=!0);let T=Xs.stringify(p,c,()=>y=null);l||(l=d.length>u||T.includes(`
`)),g<n.length-1?T+=",":e.options.trailingComma&&(e.options.lineWidth>0&&(l||(l=d.reduce((E,S)=>E+S.length+2,2)+(T.length+2)>e.options.lineWidth)),l&&(T+=",")),y&&(T+=en.lineComment(T,i,a(y))),d.push(T),u=d.length}let{start:f,end:h}=t;if(d.length===0)return f+h;if(!l){let g=d.reduce((p,y)=>p+y.length+2,2);l=e.options.lineWidth>0&&g>e.options.lineWidth}if(l){let g=f;for(let p of d)g+=p?`
${s}${r}${p}`:`
`;return`${g}
${r}${h}`}else return`${f}${o}${d.join(" ")}${o}${h}`}function tn({indent:n,options:{commentString:e}},t,i,r){if(i&&r&&(i=i.replace(/^\n+/,"")),i){let s=en.indentComment(e(i),n);t.push(s.trimStart())}}Ys.stringifyCollection=qd});var ye=_(fi=>{"use strict";var Ud=li(),Fd=ai(),Bd=Bt(),ge=C(),nn=me(),Kd=M();function ct(n,e){let t=ge.isScalar(e)?e.value:e;for(let i of n)if(ge.isPair(i)&&(i.key===e||i.key===t||ge.isScalar(i.key)&&i.key.value===t))return i}var di=class extends Bd.Collection{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(ge.MAP,e),this.items=[]}static from(e,t,i){let{keepUndefined:r,replacer:s}=i,o=new this(e),a=(c,l)=>{if(typeof s=="function")l=s.call(t,c,l);else if(Array.isArray(s)&&!s.includes(c))return;(l!==void 0||r)&&o.items.push(nn.createPair(c,l,i))};if(t instanceof Map)for(let[c,l]of t)a(c,l);else if(t&&typeof t=="object")for(let c of Object.keys(t))a(c,t[c]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,t){let i;ge.isPair(e)?i=e:!e||typeof e!="object"||!("key"in e)?i=new nn.Pair(e,e?.value):i=new nn.Pair(e.key,e.value);let r=ct(this.items,i.key),s=this.schema?.sortMapEntries;if(r){if(!t)throw new Error(`Key ${i.key} already set`);ge.isScalar(r.value)&&Kd.isScalarValue(i.value)?r.value.value=i.value:r.value=i.value}else if(s){let o=this.items.findIndex(a=>s(i,a)<0);o===-1?this.items.push(i):this.items.splice(o,0,i)}else this.items.push(i)}delete(e){let t=ct(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let r=ct(this.items,e)?.value;return(!t&&ge.isScalar(r)?r.value:r)??void 0}has(e){return!!ct(this.items,e)}set(e,t){this.add(new nn.Pair(e,t),!0)}toJSON(e,t,i){let r=i?new i:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(r);for(let s of this.items)Fd.addPairToJSMap(t,r,s);return r}toString(e,t,i){if(!e)return JSON.stringify(this);for(let r of this.items)if(!ge.isPair(r))throw new Error(`Map items must all be pairs; found ${JSON.stringify(r)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),Ud.stringifyCollection(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:i,onComment:t})}};fi.YAMLMap=di;fi.findPair=ct});var Ue=_(Vs=>{"use strict";var jd=C(),zs=ye(),Xd={collection:"map",default:!0,nodeClass:zs.YAMLMap,tag:"tag:yaml.org,2002:map",resolve(n,e){return jd.isMap(n)||e("Expected a mapping for this tag"),n},createNode:(n,e,t)=>zs.YAMLMap.from(n,e,t)};Vs.map=Xd});var be=_(Gs=>{"use strict";var Yd=tt(),zd=li(),Vd=Bt(),sn=C(),Gd=M(),Jd=fe(),ui=class extends Vd.Collection{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(sn.SEQ,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=rn(e);return typeof t!="number"?!1:this.items.splice(t,1).length>0}get(e,t){let i=rn(e);if(typeof i!="number")return;let r=this.items[i];return!t&&sn.isScalar(r)?r.value:r}has(e){let t=rn(e);return typeof t=="number"&&t<this.items.length}set(e,t){let i=rn(e);if(typeof i!="number")throw new Error(`Expected a valid index, not ${e}.`);let r=this.items[i];sn.isScalar(r)&&Gd.isScalarValue(t)?r.value=t:this.items[i]=t}toJSON(e,t){let i=[];t?.onCreate&&t.onCreate(i);let r=0;for(let s of this.items)i.push(Jd.toJS(s,String(r++),t));return i}toString(e,t,i){return e?zd.stringifyCollection(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:i,onComment:t}):JSON.stringify(this)}static from(e,t,i){let{replacer:r}=i,s=new this(e);if(t&&Symbol.iterator in Object(t)){let o=0;for(let a of t){if(typeof r=="function"){let c=t instanceof Set?a:String(o++);a=r.call(t,c,a)}s.items.push(Yd.createNode(a,void 0,i))}}return s}};function rn(n){let e=sn.isScalar(n)?n.value:n;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}Gs.YAMLSeq=ui});var Fe=_(Hs=>{"use strict";var Hd=C(),Js=be(),Wd={collection:"seq",default:!0,nodeClass:Js.YAMLSeq,tag:"tag:yaml.org,2002:seq",resolve(n,e){return Hd.isSeq(n)||e("Expected a sequence for this tag"),n},createNode:(n,e,t)=>Js.YAMLSeq.from(n,e,t)};Hs.seq=Wd});var lt=_(Ws=>{"use strict";var Qd=st(),Zd={identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify(n,e,t,i){return e=Object.assign({actualString:!0},e),Qd.stringifyString(n,e,t,i)}};Ws.string=Zd});var on=_(eo=>{"use strict";var Qs=M(),Zs={identify:n=>n==null,createNode:()=>new Qs.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new Qs.Scalar(null),stringify:({source:n},e)=>typeof n=="string"&&Zs.test.test(n)?n:e.options.nullStr};eo.nullTag=Zs});var pi=_(no=>{"use strict";var ef=M(),to={identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:n=>new ef.Scalar(n[0]==="t"||n[0]==="T"),stringify({source:n,value:e},t){if(n&&to.test.test(n)){let i=n[0]==="t"||n[0]==="T";if(e===i)return n}return e?t.options.trueStr:t.options.falseStr}};no.boolTag=to});var Be=_(io=>{"use strict";function tf({format:n,minFractionDigits:e,tag:t,value:i}){if(typeof i=="bigint")return String(i);let r=typeof i=="number"?i:Number(i);if(!isFinite(r))return isNaN(r)?".nan":r<0?"-.inf":".inf";let s=Object.is(i,-0)?"-0":JSON.stringify(i);if(!n&&e&&(!t||t==="tag:yaml.org,2002:float")&&/^-?\d/.test(s)&&!s.includes("e")){let o=s.indexOf(".");o<0&&(o=s.length,s+=".");let a=e-(s.length-o-1);for(;a-- >0;)s+="0"}return s}io.stringifyNumber=tf});var mi=_(an=>{"use strict";var nf=M(),hi=Be(),rf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:hi.stringifyNumber},sf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():hi.stringifyNumber(n)}},of={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(n){let e=new nf.Scalar(parseFloat(n)),t=n.indexOf(".");return t!==-1&&n[n.length-1]==="0"&&(e.minFractionDigits=n.length-t-1),e},stringify:hi.stringifyNumber};an.float=of;an.floatExp=sf;an.floatNaN=rf});var yi=_(ln=>{"use strict";var ro=Be(),cn=n=>typeof n=="bigint"||Number.isInteger(n),gi=(n,e,t,{intAsBigInt:i})=>i?BigInt(n):parseInt(n.substring(e),t);function so(n,e,t){let{value:i}=n;return cn(i)&&i>=0?t+i.toString(e):ro.stringifyNumber(n)}var af={identify:n=>cn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(n,e,t)=>gi(n,2,8,t),stringify:n=>so(n,8,"0o")},cf={identify:cn,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(n,e,t)=>gi(n,0,10,t),stringify:ro.stringifyNumber},lf={identify:n=>cn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(n,e,t)=>gi(n,2,16,t),stringify:n=>so(n,16,"0x")};ln.int=cf;ln.intHex=lf;ln.intOct=af});var ao=_(oo=>{"use strict";var df=Ue(),ff=on(),uf=Fe(),pf=lt(),hf=pi(),bi=mi(),Ei=yi(),mf=[df.map,uf.seq,pf.string,ff.nullTag,hf.boolTag,Ei.intOct,Ei.int,Ei.intHex,bi.floatNaN,bi.floatExp,bi.float];oo.schema=mf});var fo=_(lo=>{"use strict";var gf=M(),yf=Ue(),bf=Fe();function co(n){return typeof n=="bigint"||Number.isInteger(n)}var dn=({value:n})=>JSON.stringify(n),Ef=[{identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify:dn},{identify:n=>n==null,createNode:()=>new gf.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:dn},{identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:n=>n==="true",stringify:dn},{identify:co,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(n,e,{intAsBigInt:t})=>t?BigInt(n):parseInt(n,10),stringify:({value:n})=>co(n)?n.toString():JSON.stringify(n)},{identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:n=>parseFloat(n),stringify:dn}],Tf={default:!0,tag:"",test:/^/,resolve(n,e){return e(`Unresolved plain scalar ${JSON.stringify(n)}`),n}},_f=[yf.map,bf.seq].concat(Ef,Tf);lo.schema=_f});var _i=_(uo=>{"use strict";var dt=It("buffer"),Ti=M(),Nf=st(),Sf={identify:n=>n instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(n,e){if(typeof dt.Buffer=="function")return dt.Buffer.from(n,"base64");if(typeof atob=="function"){let t=atob(n.replace(/[\n\r]/g,"")),i=new Uint8Array(t.length);for(let r=0;r<t.length;++r)i[r]=t.charCodeAt(r);return i}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),n},stringify({comment:n,type:e,value:t},i,r,s){if(!t)return"";let o=t,a;if(typeof dt.Buffer=="function")a=o instanceof dt.Buffer?o.toString("base64"):dt.Buffer.from(o.buffer).toString("base64");else if(typeof btoa=="function"){let c="";for(let l=0;l<o.length;++l)c+=String.fromCharCode(o[l]);a=btoa(c)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=Ti.Scalar.BLOCK_LITERAL),e!==Ti.Scalar.QUOTE_DOUBLE){let c=Math.max(i.options.lineWidth-i.indent.length,i.options.minContentWidth),l=Math.ceil(a.length/c),u=new Array(l);for(let d=0,f=0;d<l;++d,f+=c)u[d]=a.substr(f,c);a=u.join(e===Ti.Scalar.BLOCK_LITERAL?`
`:" ")}return Nf.stringifyString({comment:n,type:e,value:a},i,r,s)}};uo.binary=Sf});var pn=_(un=>{"use strict";var fn=C(),Ni=me(),wf=M(),vf=be();function po(n,e){if(fn.isSeq(n))for(let t=0;t<n.items.length;++t){let i=n.items[t];if(!fn.isPair(i)){if(fn.isMap(i)){i.items.length>1&&e("Each pair must have its own sequence indicator");let r=i.items[0]||new Ni.Pair(new wf.Scalar(null));if(i.commentBefore&&(r.key.commentBefore=r.key.commentBefore?`${i.commentBefore}
${r.key.commentBefore}`:i.commentBefore),i.comment){let s=r.value??r.key;s.comment=s.comment?`${i.comment}
${s.comment}`:i.comment}i=r}n.items[t]=fn.isPair(i)?i:new Ni.Pair(i)}}else e("Expected a sequence for this tag");return n}function ho(n,e,t){let{replacer:i}=t,r=new vf.YAMLSeq(n);r.tag="tag:yaml.org,2002:pairs";let s=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof i=="function"&&(o=i.call(e,String(s++),o));let a,c;if(Array.isArray(o))if(o.length===2)a=o[0],c=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){let l=Object.keys(o);if(l.length===1)a=l[0],c=o[a];else throw new TypeError(`Expected tuple with one key, not ${l.length} keys`)}else a=o;r.items.push(Ni.createPair(a,c,t))}return r}var kf={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:po,createNode:ho};un.createPairs=ho;un.pairs=kf;un.resolvePairs=po});var vi=_(wi=>{"use strict";var mo=C(),Si=fe(),ft=ye(),Af=be(),go=pn(),we=class n extends Af.YAMLSeq{constructor(){super(),this.add=ft.YAMLMap.prototype.add.bind(this),this.delete=ft.YAMLMap.prototype.delete.bind(this),this.get=ft.YAMLMap.prototype.get.bind(this),this.has=ft.YAMLMap.prototype.has.bind(this),this.set=ft.YAMLMap.prototype.set.bind(this),this.tag=n.tag}toJSON(e,t){if(!t)return super.toJSON(e);let i=new Map;t?.onCreate&&t.onCreate(i);for(let r of this.items){let s,o;if(mo.isPair(r)?(s=Si.toJS(r.key,"",t),o=Si.toJS(r.value,s,t)):s=Si.toJS(r,"",t),i.has(s))throw new Error("Ordered maps must not include duplicate keys");i.set(s,o)}return i}static from(e,t,i){let r=go.createPairs(e,t,i),s=new this;return s.items=r.items,s}};we.tag="tag:yaml.org,2002:omap";var Lf={collection:"seq",identify:n=>n instanceof Map,nodeClass:we,default:!1,tag:"tag:yaml.org,2002:omap",resolve(n,e){let t=go.resolvePairs(n,e),i=[];for(let{key:r}of t.items)mo.isScalar(r)&&(i.includes(r.value)?e(`Ordered maps must not include duplicate keys: ${r.value}`):i.push(r.value));return Object.assign(new we,t)},createNode:(n,e,t)=>we.from(n,e,t)};wi.YAMLOMap=we;wi.omap=Lf});var _o=_(ki=>{"use strict";var yo=M();function bo({value:n,source:e},t){return e&&(n?Eo:To).test.test(e)?e:n?t.options.trueStr:t.options.falseStr}var Eo={identify:n=>n===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new yo.Scalar(!0),stringify:bo},To={identify:n=>n===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new yo.Scalar(!1),stringify:bo};ki.falseTag=To;ki.trueTag=Eo});var No=_(hn=>{"use strict";var Of=M(),Ai=Be(),If={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Ai.stringifyNumber},Rf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n.replace(/_/g,"")),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Ai.stringifyNumber(n)}},xf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(n){let e=new Of.Scalar(parseFloat(n.replace(/_/g,""))),t=n.indexOf(".");if(t!==-1){let i=n.substring(t+1).replace(/_/g,"");i[i.length-1]==="0"&&(e.minFractionDigits=i.length)}return e},stringify:Ai.stringifyNumber};hn.float=xf;hn.floatExp=Rf;hn.floatNaN=If});var wo=_(pt=>{"use strict";var So=Be(),ut=n=>typeof n=="bigint"||Number.isInteger(n);function mn(n,e,t,{intAsBigInt:i}){let r=n[0];if((r==="-"||r==="+")&&(e+=1),n=n.substring(e).replace(/_/g,""),i){switch(t){case 2:n=`0b${n}`;break;case 8:n=`0o${n}`;break;case 16:n=`0x${n}`;break}let o=BigInt(n);return r==="-"?BigInt(-1)*o:o}let s=parseInt(n,t);return r==="-"?-1*s:s}function Li(n,e,t){let{value:i}=n;if(ut(i)){let r=i.toString(e);return i<0?"-"+t+r.substr(1):t+r}return So.stringifyNumber(n)}var Cf={identify:ut,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(n,e,t)=>mn(n,2,2,t),stringify:n=>Li(n,2,"0b")},Df={identify:ut,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(n,e,t)=>mn(n,1,8,t),stringify:n=>Li(n,8,"0")},Pf={identify:ut,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(n,e,t)=>mn(n,0,10,t),stringify:So.stringifyNumber},qf={identify:ut,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(n,e,t)=>mn(n,2,16,t),stringify:n=>Li(n,16,"0x")};pt.int=Pf;pt.intBin=Cf;pt.intHex=qf;pt.intOct=Df});var Ii=_(Oi=>{"use strict";var bn=C(),gn=me(),yn=ye(),ve=class n extends yn.YAMLMap{constructor(e){super(e),this.tag=n.tag}add(e){let t;bn.isPair(e)?t=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?t=new gn.Pair(e.key,null):t=new gn.Pair(e,null),yn.findPair(this.items,t.key)||this.items.push(t)}get(e,t){let i=yn.findPair(this.items,e);return!t&&bn.isPair(i)?bn.isScalar(i.key)?i.key.value:i.key:i}set(e,t){if(typeof t!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let i=yn.findPair(this.items,e);i&&!t?this.items.splice(this.items.indexOf(i),1):!i&&t&&this.items.push(new gn.Pair(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,i){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,i);throw new Error("Set items must all have null values")}static from(e,t,i){let{replacer:r}=i,s=new this(e);if(t&&Symbol.iterator in Object(t))for(let o of t)typeof r=="function"&&(o=r.call(t,o,o)),s.items.push(gn.createPair(o,null,i));return s}};ve.tag="tag:yaml.org,2002:set";var $f={collection:"map",identify:n=>n instanceof Set,nodeClass:ve,default:!1,tag:"tag:yaml.org,2002:set",createNode:(n,e,t)=>ve.from(n,e,t),resolve(n,e){if(bn.isMap(n)){if(n.hasAllNullValues(!0))return Object.assign(new ve,n);e("Set items must all have null values")}else e("Expected a mapping for this tag");return n}};Oi.YAMLSet=ve;Oi.set=$f});var xi=_(En=>{"use strict";var Mf=Be();function Ri(n,e){let t=n[0],i=t==="-"||t==="+"?n.substring(1):n,r=o=>e?BigInt(o):Number(o),s=i.replace(/_/g,"").split(":").reduce((o,a)=>o*r(60)+r(a),r(0));return t==="-"?r(-1)*s:s}function vo(n){let{value:e}=n,t=o=>o;if(typeof e=="bigint")t=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return Mf.stringifyNumber(n);let i="";e<0&&(i="-",e*=t(-1));let r=t(60),s=[e%r];return e<60?s.unshift(0):(e=(e-s[0])/r,s.unshift(e%r),e>=60&&(e=(e-s[0])/r,s.unshift(e))),i+s.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}var Uf={identify:n=>typeof n=="bigint"||Number.isInteger(n),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(n,e,{intAsBigInt:t})=>Ri(n,t),stringify:vo},Ff={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:n=>Ri(n,!1),stringify:vo},ko={identify:n=>n instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(n){let e=n.match(ko.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");let[,t,i,r,s,o,a]=e.map(Number),c=e[7]?Number((e[7]+"00").substr(1,3)):0,l=Date.UTC(t,i-1,r,s||0,o||0,a||0,c),u=e[8];if(u&&u!=="Z"){let d=Ri(u,!1);Math.abs(d)<30&&(d*=60),l-=6e4*d}return new Date(l)},stringify:({value:n})=>n?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""};En.floatTime=Ff;En.intTime=Uf;En.timestamp=ko});var Oo=_(Lo=>{"use strict";var Bf=Ue(),Kf=on(),jf=Fe(),Xf=lt(),Yf=_i(),Ao=_o(),Ci=No(),Tn=wo(),zf=Wt(),Vf=vi(),Gf=pn(),Jf=Ii(),Di=xi(),Hf=[Bf.map,jf.seq,Xf.string,Kf.nullTag,Ao.trueTag,Ao.falseTag,Tn.intBin,Tn.intOct,Tn.int,Tn.intHex,Ci.floatNaN,Ci.floatExp,Ci.float,Yf.binary,zf.merge,Vf.omap,Gf.pairs,Jf.set,Di.intTime,Di.floatTime,Di.timestamp];Lo.schema=Hf});var Uo=_($i=>{"use strict";var Co=Ue(),Wf=on(),Do=Fe(),Qf=lt(),Zf=pi(),Pi=mi(),qi=yi(),eu=ao(),tu=fo(),Po=_i(),ht=Wt(),qo=vi(),$o=pn(),Io=Oo(),Mo=Ii(),_n=xi(),Ro=new Map([["core",eu.schema],["failsafe",[Co.map,Do.seq,Qf.string]],["json",tu.schema],["yaml11",Io.schema],["yaml-1.1",Io.schema]]),xo={binary:Po.binary,bool:Zf.boolTag,float:Pi.float,floatExp:Pi.floatExp,floatNaN:Pi.floatNaN,floatTime:_n.floatTime,int:qi.int,intHex:qi.intHex,intOct:qi.intOct,intTime:_n.intTime,map:Co.map,merge:ht.merge,null:Wf.nullTag,omap:qo.omap,pairs:$o.pairs,seq:Do.seq,set:Mo.set,timestamp:_n.timestamp},nu={"tag:yaml.org,2002:binary":Po.binary,"tag:yaml.org,2002:merge":ht.merge,"tag:yaml.org,2002:omap":qo.omap,"tag:yaml.org,2002:pairs":$o.pairs,"tag:yaml.org,2002:set":Mo.set,"tag:yaml.org,2002:timestamp":_n.timestamp};function iu(n,e,t){let i=Ro.get(e);if(i&&!n)return t&&!i.includes(ht.merge)?i.concat(ht.merge):i.slice();let r=i;if(!r)if(Array.isArray(n))r=[];else{let s=Array.from(Ro.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${s} or define customTags array`)}if(Array.isArray(n))for(let s of n)r=r.concat(s);else typeof n=="function"&&(r=n(r.slice()));return t&&(r=r.concat(ht.merge)),r.reduce((s,o)=>{let a=typeof o=="string"?xo[o]:o;if(!a){let c=JSON.stringify(o),l=Object.keys(xo).map(u=>JSON.stringify(u)).join(", ");throw new Error(`Unknown custom tag ${c}; use one of ${l}`)}return s.includes(a)||s.push(a),s},[])}$i.coreKnownTags=nu;$i.getTags=iu});var Fi=_(Fo=>{"use strict";var Mi=C(),ru=Ue(),su=Fe(),ou=lt(),Nn=Uo(),au=(n,e)=>n.key<e.key?-1:n.key>e.key?1:0,Ui=class n{constructor({compat:e,customTags:t,merge:i,resolveKnownTags:r,schema:s,sortMapEntries:o,toStringDefaults:a}){this.compat=Array.isArray(e)?Nn.getTags(e,"compat"):e?Nn.getTags(null,e):null,this.name=typeof s=="string"&&s||"core",this.knownTags=r?Nn.coreKnownTags:{},this.tags=Nn.getTags(t,this.name,i),this.toStringOptions=a??null,Object.defineProperty(this,Mi.MAP,{value:ru.map}),Object.defineProperty(this,Mi.SCALAR,{value:ou.string}),Object.defineProperty(this,Mi.SEQ,{value:su.seq}),this.sortMapEntries=typeof o=="function"?o:o===!0?au:null}clone(){let e=Object.create(n.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}};Fo.Schema=Ui});var Ko=_(Bo=>{"use strict";var cu=C(),Bi=ot(),mt=nt();function lu(n,e){let t=[],i=e.directives===!0;if(e.directives!==!1&&n.directives){let c=n.directives.toString(n);c?(t.push(c),i=!0):n.directives.docStart&&(i=!0)}i&&t.push("---");let r=Bi.createStringifyContext(n,e),{commentString:s}=r.options;if(n.commentBefore){t.length!==1&&t.unshift("");let c=s(n.commentBefore);t.unshift(mt.indentComment(c,""))}let o=!1,a=null;if(n.contents){if(cu.isNode(n.contents)){if(n.contents.spaceBefore&&i&&t.push(""),n.contents.commentBefore){let u=s(n.contents.commentBefore);t.push(mt.indentComment(u,""))}r.forceBlockIndent=!!n.comment,a=n.contents.comment}let c=a?void 0:()=>o=!0,l=Bi.stringify(n.contents,r,()=>a=null,c);a&&(l+=mt.lineComment(l,"",s(a))),(l[0]==="|"||l[0]===">")&&t[t.length-1]==="---"?t[t.length-1]=`--- ${l}`:t.push(l)}else t.push(Bi.stringify(n.contents,r));if(n.directives?.docEnd)if(n.comment){let c=s(n.comment);c.includes(`
`)?(t.push("..."),t.push(mt.indentComment(c,""))):t.push(`... ${c}`)}else t.push("...");else{let c=n.comment;c&&o&&(c=c.replace(/^\n+/,"")),c&&((!o||a)&&t[t.length-1]!==""&&t.push(""),t.push(mt.indentComment(s(c),"")))}return t.join(`
`)+`
`}Bo.stringifyDocument=lu});var gt=_(jo=>{"use strict";var du=et(),Ke=Bt(),W=C(),fu=me(),uu=fe(),pu=Fi(),hu=Ko(),Ki=$t(),mu=zn(),gu=tt(),ji=Yn(),Xi=class n{constructor(e,t,i){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,W.NODE_TYPE,{value:W.DOC});let r=null;typeof t=="function"||Array.isArray(t)?r=t:i===void 0&&t&&(i=t,t=void 0);let s=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},i);this.options=s;let{version:o}=s;i?._directives?(this.directives=i._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new ji.Directives({version:o}),this.setSchema(o,i),this.contents=e===void 0?null:this.createNode(e,r,i)}clone(){let e=Object.create(n.prototype,{[W.NODE_TYPE]:{value:W.DOC}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=W.isNode(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){je(this.contents)&&this.contents.add(e)}addIn(e,t){je(this.contents)&&this.contents.addIn(e,t)}createAlias(e,t){if(!e.anchor){let i=Ki.anchorNames(this);e.anchor=!t||i.has(t)?Ki.findNewAnchor(t||"a",i):t}return new du.Alias(e.anchor)}createNode(e,t,i){let r;if(typeof t=="function")e=t.call({"":e},"",e),r=t;else if(Array.isArray(t)){let y=E=>typeof E=="number"||E instanceof String||E instanceof Number,T=t.filter(y).map(String);T.length>0&&(t=t.concat(T)),r=t}else i===void 0&&t&&(i=t,t=void 0);let{aliasDuplicateObjects:s,anchorPrefix:o,flow:a,keepUndefined:c,onTagObj:l,tag:u}=i??{},{onAnchor:d,setAnchors:f,sourceObjects:h}=Ki.createNodeAnchors(this,o||"a"),g={aliasDuplicateObjects:s??!0,keepUndefined:c??!1,onAnchor:d,onTagObj:l,replacer:r,schema:this.schema,sourceObjects:h},p=gu.createNode(e,u,g);return a&&W.isCollection(p)&&(p.flow=!0),f(),p}createPair(e,t,i={}){let r=this.createNode(e,null,i),s=this.createNode(t,null,i);return new fu.Pair(r,s)}delete(e){return je(this.contents)?this.contents.delete(e):!1}deleteIn(e){return Ke.isEmptyPath(e)?this.contents==null?!1:(this.contents=null,!0):je(this.contents)?this.contents.deleteIn(e):!1}get(e,t){return W.isCollection(this.contents)?this.contents.get(e,t):void 0}getIn(e,t){return Ke.isEmptyPath(e)?!t&&W.isScalar(this.contents)?this.contents.value:this.contents:W.isCollection(this.contents)?this.contents.getIn(e,t):void 0}has(e){return W.isCollection(this.contents)?this.contents.has(e):!1}hasIn(e){return Ke.isEmptyPath(e)?this.contents!==void 0:W.isCollection(this.contents)?this.contents.hasIn(e):!1}set(e,t){this.contents==null?this.contents=Ke.collectionFromPath(this.schema,[e],t):je(this.contents)&&this.contents.set(e,t)}setIn(e,t){Ke.isEmptyPath(e)?this.contents=t:this.contents==null?this.contents=Ke.collectionFromPath(this.schema,Array.from(e),t):je(this.contents)&&this.contents.setIn(e,t)}setSchema(e,t={}){typeof e=="number"&&(e=String(e));let i;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new ji.Directives({version:"1.1"}),i={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new ji.Directives({version:e}),i={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,i=null;break;default:{let r=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${r}`)}}if(t.schema instanceof Object)this.schema=t.schema;else if(i)this.schema=new pu.Schema(Object.assign(i,t));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:t,mapAsMap:i,maxAliasCount:r,onAnchor:s,reviver:o}={}){let a={anchors:new Map,doc:this,keep:!e,mapAsMap:i===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},c=uu.toJS(this.contents,t??"",a);if(typeof s=="function")for(let{count:l,res:u}of a.anchors.values())s(u,l);return typeof o=="function"?mu.applyReviver(o,{"":c},"",c):c}toJSON(e,t){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:t})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){let t=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${t}`)}return hu.stringifyDocument(this,e)}};function je(n){if(W.isCollection(n))return!0;throw new Error("Expected a YAML collection as document contents")}jo.Document=Xi});var Et=_(bt=>{"use strict";var yt=class extends Error{constructor(e,t,i,r){super(),this.name=e,this.code=i,this.message=r,this.pos=t}},Yi=class extends yt{constructor(e,t,i){super("YAMLParseError",e,t,i)}},zi=class extends yt{constructor(e,t,i){super("YAMLWarning",e,t,i)}},yu=(n,e)=>t=>{if(t.pos[0]===-1)return;t.linePos=t.pos.map(a=>e.linePos(a));let{line:i,col:r}=t.linePos[0];t.message+=` at line ${i}, column ${r}`;let s=r-1,o=n.substring(e.lineStarts[i-1],e.lineStarts[i]).replace(/[\n\r]+$/,"");if(s>=60&&o.length>80){let a=Math.min(s-39,o.length-79);o="\u2026"+o.substring(a),s-=a-1}if(o.length>80&&(o=o.substring(0,79)+"\u2026"),i>1&&/^ *$/.test(o.substring(0,s))){let a=n.substring(e.lineStarts[i-2],e.lineStarts[i-1]);a.length>80&&(a=a.substring(0,79)+`\u2026
`),o=a+o}if(/[^ ]/.test(o)){let a=1,c=t.linePos[1];c?.line===i&&c.col>r&&(a=Math.max(1,Math.min(c.col-r,80-s)));let l=" ".repeat(s)+"^".repeat(a);t.message+=`:

${o}
${l}
`}};bt.YAMLError=yt;bt.YAMLParseError=Yi;bt.YAMLWarning=zi;bt.prettifyError=yu});var Tt=_(Xo=>{"use strict";function bu(n,{flow:e,indicator:t,next:i,offset:r,onError:s,parentIndent:o,startOnNewline:a}){let c=!1,l=a,u=a,d="",f="",h=!1,g=!1,p=null,y=null,T=null,E=null,S=null,w=null,k=null;for(let b of n)switch(g&&(b.type!=="space"&&b.type!=="newline"&&b.type!=="comma"&&s(b.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),g=!1),p&&(l&&b.type!=="comment"&&b.type!=="newline"&&s(p,"TAB_AS_INDENT","Tabs are not allowed as indentation"),p=null),b.type){case"space":!e&&(t!=="doc-start"||i?.type!=="flow-collection")&&b.source.includes("	")&&(p=b),u=!0;break;case"comment":{u||s(b,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let O=b.source.substring(1)||" ";d?d+=f+O:d=O,f="",l=!1;break}case"newline":l?d?d+=b.source:(!w||t!=="seq-item-ind")&&(c=!0):f+=b.source,l=!0,h=!0,(y||T)&&(E=b),u=!0;break;case"anchor":y&&s(b,"MULTIPLE_ANCHORS","A node can have at most one anchor"),b.source.endsWith(":")&&s(b.offset+b.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),y=b,k??(k=b.offset),l=!1,u=!1,g=!0;break;case"tag":{T&&s(b,"MULTIPLE_TAGS","A node can have at most one tag"),T=b,k??(k=b.offset),l=!1,u=!1,g=!0;break}case t:(y||T)&&s(b,"BAD_PROP_ORDER",`Anchors and tags must be after the ${b.source} indicator`),w&&s(b,"UNEXPECTED_TOKEN",`Unexpected ${b.source} in ${e??"collection"}`),w=b,l=t==="seq-item-ind"||t==="explicit-key-ind",u=!1;break;case"comma":if(e){S&&s(b,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),S=b,l=!1,u=!1;break}default:s(b,"UNEXPECTED_TOKEN",`Unexpected ${b.type} token`),l=!1,u=!1}let v=n[n.length-1],N=v?v.offset+v.source.length:r;return g&&i&&i.type!=="space"&&i.type!=="newline"&&i.type!=="comma"&&(i.type!=="scalar"||i.source!=="")&&s(i.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),p&&(l&&p.indent<=o||i?.type==="block-map"||i?.type==="block-seq")&&s(p,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:S,found:w,spaceBefore:c,comment:d,hasNewline:h,anchor:y,tag:T,newlineAfterProp:E,end:N,start:k??N}}Xo.resolveProps=bu});var Sn=_(Yo=>{"use strict";function Vi(n){if(!n)return null;switch(n.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(n.source.includes(`
`))return!0;if(n.end){for(let e of n.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(let e of n.items){for(let t of e.start)if(t.type==="newline")return!0;if(e.sep){for(let t of e.sep)if(t.type==="newline")return!0}if(Vi(e.key)||Vi(e.value))return!0}return!1;default:return!0}}Yo.containsNewline=Vi});var Gi=_(zo=>{"use strict";var Eu=Sn();function Tu(n,e,t){if(e?.type==="flow-collection"){let i=e.end[0];i.indent===n&&(i.source==="]"||i.source==="}")&&Eu.containsNewline(e)&&t(i,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}zo.flowIndentCheck=Tu});var Ji=_(Go=>{"use strict";var Vo=C();function _u(n,e,t){let{uniqueKeys:i}=n.options;if(i===!1)return!1;let r=typeof i=="function"?i:(s,o)=>s===o||Vo.isScalar(s)&&Vo.isScalar(o)&&s.value===o.value;return e.some(s=>r(s.key,t))}Go.mapIncludes=_u});var ea=_(Zo=>{"use strict";var Jo=me(),Nu=ye(),Ho=Tt(),Su=Sn(),Wo=Gi(),wu=Ji(),Qo="All mapping items must start at the same column";function vu({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=s?.nodeClass??Nu.YAMLMap,a=new o(t.schema);t.atRoot&&(t.atRoot=!1);let c=i.offset,l=null;for(let u of i.items){let{start:d,key:f,sep:h,value:g}=u,p=Ho.resolveProps(d,{indicator:"explicit-key-ind",next:f??h?.[0],offset:c,onError:r,parentIndent:i.indent,startOnNewline:!0}),y=!p.found;if(y){if(f&&(f.type==="block-seq"?r(c,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in f&&f.indent!==i.indent&&r(c,"BAD_INDENT",Qo)),!p.anchor&&!p.tag&&!h){l=p.end,p.comment&&(a.comment?a.comment+=`
`+p.comment:a.comment=p.comment);continue}(p.newlineAfterProp||Su.containsNewline(f))&&r(f??d[d.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else p.found?.indent!==i.indent&&r(c,"BAD_INDENT",Qo);t.atKey=!0;let T=p.end,E=f?n(t,f,p,r):e(t,T,d,null,p,r);t.schema.compat&&Wo.flowIndentCheck(i.indent,f,r),t.atKey=!1,wu.mapIncludes(t,a.items,E)&&r(T,"DUPLICATE_KEY","Map keys must be unique");let S=Ho.resolveProps(h??[],{indicator:"map-value-ind",next:g,offset:E.range[2],onError:r,parentIndent:i.indent,startOnNewline:!f||f.type==="block-scalar"});if(c=S.end,S.found){y&&(g?.type==="block-map"&&!S.hasNewline&&r(c,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),t.options.strict&&p.start<S.found.offset-1024&&r(E.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));let w=g?n(t,g,S,r):e(t,c,h,null,S,r);t.schema.compat&&Wo.flowIndentCheck(i.indent,g,r),c=w.range[2];let k=new Jo.Pair(E,w);t.options.keepSourceTokens&&(k.srcToken=u),a.items.push(k)}else{y&&r(E.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),S.comment&&(E.comment?E.comment+=`
`+S.comment:E.comment=S.comment);let w=new Jo.Pair(E);t.options.keepSourceTokens&&(w.srcToken=u),a.items.push(w)}}return l&&l<c&&r(l,"IMPOSSIBLE","Map comment with trailing content"),a.range=[i.offset,c,l??c],a}Zo.resolveBlockMap=vu});var na=_(ta=>{"use strict";var ku=be(),Au=Tt(),Lu=Gi();function Ou({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=s?.nodeClass??ku.YAMLSeq,a=new o(t.schema);t.atRoot&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let c=i.offset,l=null;for(let{start:u,value:d}of i.items){let f=Au.resolveProps(u,{indicator:"seq-item-ind",next:d,offset:c,onError:r,parentIndent:i.indent,startOnNewline:!0});if(!f.found)if(f.anchor||f.tag||d)d?.type==="block-seq"?r(f.end,"BAD_INDENT","All sequence items must start at the same column"):r(c,"MISSING_CHAR","Sequence item without - indicator");else{l=f.end,f.comment&&(a.comment=f.comment);continue}let h=d?n(t,d,f,r):e(t,f.end,u,null,f,r);t.schema.compat&&Lu.flowIndentCheck(i.indent,d,r),c=h.range[2],a.items.push(h)}return a.range=[i.offset,c,l??c],a}ta.resolveBlockSeq=Ou});var Xe=_(ia=>{"use strict";function Iu(n,e,t,i){let r="";if(n){let s=!1,o="";for(let a of n){let{source:c,type:l}=a;switch(l){case"space":s=!0;break;case"comment":{t&&!s&&i(a,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let u=c.substring(1)||" ";r?r+=o+u:r=u,o="";break}case"newline":r&&(o+=c),s=!0;break;default:i(a,"UNEXPECTED_TOKEN",`Unexpected ${l} at node end`)}e+=c.length}}return{comment:r,offset:e}}ia.resolveEnd=Iu});var aa=_(oa=>{"use strict";var Ru=C(),xu=me(),ra=ye(),Cu=be(),Du=Xe(),sa=Tt(),Pu=Sn(),qu=Ji(),Hi="Block collections are not allowed within flow collections",Wi=n=>n&&(n.type==="block-map"||n.type==="block-seq");function $u({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=i.start.source==="{",a=o?"flow map":"flow sequence",c=s?.nodeClass??(o?ra.YAMLMap:Cu.YAMLSeq),l=new c(t.schema);l.flow=!0;let u=t.atRoot;u&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let d=i.offset+i.start.source.length;for(let y=0;y<i.items.length;++y){let T=i.items[y],{start:E,key:S,sep:w,value:k}=T,v=sa.resolveProps(E,{flow:a,indicator:"explicit-key-ind",next:S??w?.[0],offset:d,onError:r,parentIndent:i.indent,startOnNewline:!1});if(!v.found){if(!v.anchor&&!v.tag&&!w&&!k){y===0&&v.comma?r(v.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`):y<i.items.length-1&&r(v.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${a}`),v.comment&&(l.comment?l.comment+=`
`+v.comment:l.comment=v.comment),d=v.end;continue}!o&&t.options.strict&&Pu.containsNewline(S)&&r(S,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(y===0)v.comma&&r(v.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`);else if(v.comma||r(v.start,"MISSING_CHAR",`Missing , between ${a} items`),v.comment){let N="";e:for(let b of E)switch(b.type){case"comma":case"space":break;case"comment":N=b.source.substring(1);break e;default:break e}if(N){let b=l.items[l.items.length-1];Ru.isPair(b)&&(b=b.value??b.key),b.comment?b.comment+=`
`+N:b.comment=N,v.comment=v.comment.substring(N.length+1)}}if(!o&&!w&&!v.found){let N=k?n(t,k,v,r):e(t,v.end,w,null,v,r);l.items.push(N),d=N.range[2],Wi(k)&&r(N.range,"BLOCK_IN_FLOW",Hi)}else{t.atKey=!0;let N=v.end,b=S?n(t,S,v,r):e(t,N,E,null,v,r);Wi(S)&&r(b.range,"BLOCK_IN_FLOW",Hi),t.atKey=!1;let O=sa.resolveProps(w??[],{flow:a,indicator:"map-value-ind",next:k,offset:b.range[2],onError:r,parentIndent:i.indent,startOnNewline:!1});if(O.found){if(!o&&!v.found&&t.options.strict){if(w)for(let q of w){if(q===O.found)break;if(q.type==="newline"){r(q,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}v.start<O.found.offset-1024&&r(O.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else k&&("source"in k&&k.source?.[0]===":"?r(k,"MISSING_CHAR",`Missing space after : in ${a}`):r(O.start,"MISSING_CHAR",`Missing , or : between ${a} items`));let J=k?n(t,k,O,r):O.found?e(t,O.end,w,null,O,r):null;J?Wi(k)&&r(J.range,"BLOCK_IN_FLOW",Hi):O.comment&&(b.comment?b.comment+=`
`+O.comment:b.comment=O.comment);let B=new xu.Pair(b,J);if(t.options.keepSourceTokens&&(B.srcToken=T),o){let q=l;qu.mapIncludes(t,q.items,b)&&r(N,"DUPLICATE_KEY","Map keys must be unique"),q.items.push(B)}else{let q=new ra.YAMLMap(t.schema);q.flow=!0,q.items.push(B);let L=(J??b).range;q.range=[b.range[0],L[1],L[2]],l.items.push(q)}d=J?J.range[2]:O.end}}let f=o?"}":"]",[h,...g]=i.end,p=d;if(h?.source===f)p=h.offset+h.source.length;else{let y=a[0].toUpperCase()+a.substring(1),T=u?`${y} must end with a ${f}`:`${y} in block collection must be sufficiently indented and end with a ${f}`;r(d,u?"MISSING_CHAR":"BAD_INDENT",T),h&&h.source.length!==1&&g.unshift(h)}if(g.length>0){let y=Du.resolveEnd(g,p,t.options.strict,r);y.comment&&(l.comment?l.comment+=`
`+y.comment:l.comment=y.comment),l.range=[i.offset,p,y.offset]}else l.range=[i.offset,p,p];return l}oa.resolveFlowCollection=$u});var la=_(ca=>{"use strict";var Mu=C(),Uu=M(),Fu=ye(),Bu=be(),Ku=ea(),ju=na(),Xu=aa();function Qi(n,e,t,i,r,s){let o=t.type==="block-map"?Ku.resolveBlockMap(n,e,t,i,s):t.type==="block-seq"?ju.resolveBlockSeq(n,e,t,i,s):Xu.resolveFlowCollection(n,e,t,i,s),a=o.constructor;return r==="!"||r===a.tagName?(o.tag=a.tagName,o):(r&&(o.tag=r),o)}function Yu(n,e,t,i,r){let s=i.tag,o=s?e.directives.tagName(s.source,f=>r(s,"TAG_RESOLVE_FAILED",f)):null;if(t.type==="block-seq"){let{anchor:f,newlineAfterProp:h}=i,g=f&&s?f.offset>s.offset?f:s:f??s;g&&(!h||h.offset<g.offset)&&r(g,"MISSING_CHAR","Missing newline after block sequence props")}let a=t.type==="block-map"?"map":t.type==="block-seq"?"seq":t.start.source==="{"?"map":"seq";if(!s||!o||o==="!"||o===Fu.YAMLMap.tagName&&a==="map"||o===Bu.YAMLSeq.tagName&&a==="seq")return Qi(n,e,t,r,o);let c=e.schema.tags.find(f=>f.tag===o&&f.collection===a);if(!c){let f=e.schema.knownTags[o];if(f?.collection===a)e.schema.tags.push(Object.assign({},f,{default:!1})),c=f;else return f?r(s,"BAD_COLLECTION_TYPE",`${f.tag} used for ${a} collection, but expects ${f.collection??"scalar"}`,!0):r(s,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),Qi(n,e,t,r,o)}let l=Qi(n,e,t,r,o,c),u=c.resolve?.(l,f=>r(s,"TAG_RESOLVE_FAILED",f),e.options)??l,d=Mu.isNode(u)?u:new Uu.Scalar(u);return d.range=l.range,d.tag=o,c?.format&&(d.format=c.format),d}ca.composeCollection=Yu});var er=_(da=>{"use strict";var Zi=M();function zu(n,e,t){let i=e.offset,r=Vu(e,n.options.strict,t);if(!r)return{value:"",type:null,comment:"",range:[i,i,i]};let s=r.mode===">"?Zi.Scalar.BLOCK_FOLDED:Zi.Scalar.BLOCK_LITERAL,o=e.source?Gu(e.source):[],a=o.length;for(let p=o.length-1;p>=0;--p){let y=o[p][1];if(y===""||y==="\r")a=p;else break}if(a===0){let p=r.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"",y=i+r.length;return e.source&&(y+=e.source.length),{value:p,type:s,comment:r.comment,range:[i,y,y]}}let c=e.indent+r.indent,l=e.offset+r.length,u=0;for(let p=0;p<a;++p){let[y,T]=o[p];if(T===""||T==="\r")r.indent===0&&y.length>c&&(c=y.length);else{y.length<c&&t(l+y.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),r.indent===0&&(c=y.length),u=p,c===0&&!n.atRoot&&t(l,"BAD_INDENT","Block scalar values in collections must be indented");break}l+=y.length+T.length+1}for(let p=o.length-1;p>=a;--p)o[p][0].length>c&&(a=p+1);let d="",f="",h=!1;for(let p=0;p<u;++p)d+=o[p][0].slice(c)+`
`;for(let p=u;p<a;++p){let[y,T]=o[p];l+=y.length+T.length+1;let E=T[T.length-1]==="\r";if(E&&(T=T.slice(0,-1)),T&&y.length<c){let w=`Block scalar lines must not be less indented than their ${r.indent?"explicit indentation indicator":"first line"}`;t(l-T.length-(E?2:1),"BAD_INDENT",w),y=""}s===Zi.Scalar.BLOCK_LITERAL?(d+=f+y.slice(c)+T,f=`
`):y.length>c||T[0]==="	"?(f===" "?f=`
`:!h&&f===`
`&&(f=`

`),d+=f+y.slice(c)+T,f=`
`,h=!0):T===""?f===`
`?d+=`
`:f=`
`:(d+=f+T,f=" ",h=!1)}switch(r.chomp){case"-":break;case"+":for(let p=a;p<o.length;++p)d+=`
`+o[p][0].slice(c);d[d.length-1]!==`
`&&(d+=`
`);break;default:d+=`
`}let g=i+r.length+e.source.length;return{value:d,type:s,comment:r.comment,range:[i,g,g]}}function Vu({offset:n,props:e},t,i){if(e[0].type!=="block-scalar-header")return i(e[0],"IMPOSSIBLE","Block scalar header not found"),null;let{source:r}=e[0],s=r[0],o=0,a="",c=-1;for(let f=1;f<r.length;++f){let h=r[f];if(!a&&(h==="-"||h==="+"))a=h;else{let g=Number(h);!o&&g?o=g:c===-1&&(c=n+f)}}c!==-1&&i(c,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${r}`);let l=!1,u="",d=r.length;for(let f=1;f<e.length;++f){let h=e[f];switch(h.type){case"space":l=!0;case"newline":d+=h.source.length;break;case"comment":t&&!l&&i(h,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),d+=h.source.length,u=h.source.substring(1);break;case"error":i(h,"UNEXPECTED_TOKEN",h.message),d+=h.source.length;break;default:{let g=`Unexpected token in block scalar header: ${h.type}`;i(h,"UNEXPECTED_TOKEN",g);let p=h.source;p&&typeof p=="string"&&(d+=p.length)}}}return{mode:s,indent:o,chomp:a,comment:u,length:d}}function Gu(n){let e=n.split(/\n( *)/),t=e[0],i=t.match(/^( *)/),s=[i?.[1]?[i[1],t.slice(i[1].length)]:["",t]];for(let o=1;o<e.length;o+=2)s.push([e[o],e[o+1]]);return s}da.resolveBlockScalar=zu});var nr=_(ua=>{"use strict";var tr=M(),Ju=Xe();function Hu(n,e,t){let{offset:i,type:r,source:s,end:o}=n,a,c,l=(f,h,g)=>t(i+f,h,g);switch(r){case"scalar":a=tr.Scalar.PLAIN,c=Wu(s,l);break;case"single-quoted-scalar":a=tr.Scalar.QUOTE_SINGLE,c=Qu(s,l);break;case"double-quoted-scalar":a=tr.Scalar.QUOTE_DOUBLE,c=Zu(s,l);break;default:return t(n,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${r}`),{value:"",type:null,comment:"",range:[i,i+s.length,i+s.length]}}let u=i+s.length,d=Ju.resolveEnd(o,u,e,t);return{value:c,type:a,comment:d.comment,range:[i,u,d.offset]}}function Wu(n,e){let t="";switch(n[0]){case"	":t="a tab character";break;case",":t="flow indicator character ,";break;case"%":t="directive indicator character %";break;case"|":case">":{t=`block scalar indicator ${n[0]}`;break}case"@":case"`":{t=`reserved character ${n[0]}`;break}}return t&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${t}`),fa(n)}function Qu(n,e){return(n[n.length-1]!=="'"||n.length===1)&&e(n.length,"MISSING_CHAR","Missing closing 'quote"),fa(n.slice(1,-1)).replace(/''/g,"'")}function fa(n){let e,t;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),t=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,t=/[ \t]*(.*?)[ \t]*\r?\n/sy}let i=e.exec(n);if(!i)return n;let r=i[1],s=" ",o=e.lastIndex;for(t.lastIndex=o;i=t.exec(n);)i[1]===""?s===`
`?r+=s:s=`
`:(r+=s+i[1],s=" "),o=t.lastIndex;let a=/[ \t]*(.*)/sy;return a.lastIndex=o,i=a.exec(n),r+s+(i?.[1]??"")}function Zu(n,e){let t="";for(let i=1;i<n.length-1;++i){let r=n[i];if(!(r==="\r"&&n[i+1]===`
`))if(r===`
`){let{fold:s,offset:o}=ep(n,i);t+=s,i=o}else if(r==="\\"){let s=n[++i],o=tp[s];if(o)t+=o;else if(s===`
`)for(s=n[i+1];s===" "||s==="	";)s=n[++i+1];else if(s==="\r"&&n[i+1]===`
`)for(s=n[++i+1];s===" "||s==="	";)s=n[++i+1];else if(s==="x"||s==="u"||s==="U"){let a=s==="x"?2:s==="u"?4:8;t+=np(n,i+1,a,e),i+=a}else{let a=n.substr(i-1,2);e(i-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),t+=a}}else if(r===" "||r==="	"){let s=i,o=n[i+1];for(;o===" "||o==="	";)o=n[++i+1];o!==`
`&&!(o==="\r"&&n[i+2]===`
`)&&(t+=i>s?n.slice(s,i+1):r)}else t+=r}return(n[n.length-1]!=='"'||n.length===1)&&e(n.length,"MISSING_CHAR",'Missing closing "quote'),t}function ep(n,e){let t="",i=n[e+1];for(;(i===" "||i==="	"||i===`
`||i==="\r")&&!(i==="\r"&&n[e+2]!==`
`);)i===`
`&&(t+=`
`),e+=1,i=n[e+1];return t||(t=" "),{fold:t,offset:e}}var tp={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function np(n,e,t,i){let r=n.substr(e,t),o=r.length===t&&/^[0-9a-fA-F]+$/.test(r)?parseInt(r,16):NaN;try{return String.fromCodePoint(o)}catch{let a=n.substr(e-2,t+2);return i(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),a}}ua.resolveFlowScalar=Hu});var ma=_(ha=>{"use strict";var ke=C(),pa=M(),ip=er(),rp=nr();function sp(n,e,t,i){let{value:r,type:s,comment:o,range:a}=e.type==="block-scalar"?ip.resolveBlockScalar(n,e,i):rp.resolveFlowScalar(e,n.options.strict,i),c=t?n.directives.tagName(t.source,d=>i(t,"TAG_RESOLVE_FAILED",d)):null,l;n.options.stringKeys&&n.atKey?l=n.schema[ke.SCALAR]:c?l=op(n.schema,r,c,t,i):e.type==="scalar"?l=ap(n,r,e,i):l=n.schema[ke.SCALAR];let u;try{let d=l.resolve(r,f=>i(t??e,"TAG_RESOLVE_FAILED",f),n.options);u=ke.isScalar(d)?d:new pa.Scalar(d)}catch(d){let f=d instanceof Error?d.message:String(d);i(t??e,"TAG_RESOLVE_FAILED",f),u=new pa.Scalar(r)}return u.range=a,u.source=r,s&&(u.type=s),c&&(u.tag=c),l.format&&(u.format=l.format),o&&(u.comment=o),u}function op(n,e,t,i,r){if(t==="!")return n[ke.SCALAR];let s=[];for(let a of n.tags)if(!a.collection&&a.tag===t)if(a.default&&a.test)s.push(a);else return a;for(let a of s)if(a.test?.test(e))return a;let o=n.knownTags[t];return o&&!o.collection?(n.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(r(i,"TAG_RESOLVE_FAILED",`Unresolved tag: ${t}`,t!=="tag:yaml.org,2002:str"),n[ke.SCALAR])}function ap({atKey:n,directives:e,schema:t},i,r,s){let o=t.tags.find(a=>(a.default===!0||n&&a.default==="key")&&a.test?.test(i))||t[ke.SCALAR];if(t.compat){let a=t.compat.find(c=>c.default&&c.test?.test(i))??t[ke.SCALAR];if(o.tag!==a.tag){let c=e.tagString(o.tag),l=e.tagString(a.tag),u=`Value may be parsed as either ${c} or ${l}`;s(r,"TAG_RESOLVE_FAILED",u,!0)}}return o}ha.composeScalar=sp});var ya=_(ga=>{"use strict";function cp(n,e,t){if(e){t??(t=e.length);for(let i=t-1;i>=0;--i){let r=e[i];switch(r.type){case"space":case"comment":case"newline":n-=r.source.length;continue}for(r=e[++i];r?.type==="space";)n+=r.source.length,r=e[++i];break}}return n}ga.emptyScalarPosition=cp});var Ta=_(rr=>{"use strict";var lp=et(),dp=C(),fp=la(),ba=ma(),up=Xe(),pp=ya(),hp={composeNode:Ea,composeEmptyNode:ir};function Ea(n,e,t,i){let r=n.atKey,{spaceBefore:s,comment:o,anchor:a,tag:c}=t,l,u=!0;switch(e.type){case"alias":l=mp(n,e,i),(a||c)&&i(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":l=ba.composeScalar(n,e,c,i),a&&(l.anchor=a.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":try{l=fp.composeCollection(hp,n,e,t,i),a&&(l.anchor=a.source.substring(1))}catch(d){let f=d instanceof Error?d.message:String(d);i(e,"RESOURCE_EXHAUSTION",f)}break;default:{let d=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;i(e,"UNEXPECTED_TOKEN",d),u=!1}}return l??(l=ir(n,e.offset,void 0,null,t,i)),a&&l.anchor===""&&i(a,"BAD_ALIAS","Anchor cannot be an empty string"),r&&n.options.stringKeys&&(!dp.isScalar(l)||typeof l.value!="string"||l.tag&&l.tag!=="tag:yaml.org,2002:str")&&i(c??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),s&&(l.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?l.comment=o:l.commentBefore=o),n.options.keepSourceTokens&&u&&(l.srcToken=e),l}function ir(n,e,t,i,{spaceBefore:r,comment:s,anchor:o,tag:a,end:c},l){let u={type:"scalar",offset:pp.emptyScalarPosition(e,t,i),indent:-1,source:""},d=ba.composeScalar(n,u,a,l);return o&&(d.anchor=o.source.substring(1),d.anchor===""&&l(o,"BAD_ALIAS","Anchor cannot be an empty string")),r&&(d.spaceBefore=!0),s&&(d.comment=s,d.range[2]=c),d}function mp({options:n},{offset:e,source:t,end:i},r){let s=new lp.Alias(t.substring(1));s.source===""&&r(e,"BAD_ALIAS","Alias cannot be an empty string"),s.source.endsWith(":")&&r(e+t.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);let o=e+t.length,a=up.resolveEnd(i,o,n.strict,r);return s.range=[e,o,a.offset],a.comment&&(s.comment=a.comment),s}rr.composeEmptyNode=ir;rr.composeNode=Ea});var Sa=_(Na=>{"use strict";var gp=gt(),_a=Ta(),yp=Xe(),bp=Tt();function Ep(n,e,{offset:t,start:i,value:r,end:s},o){let a=Object.assign({_directives:e},n),c=new gp.Document(void 0,a),l={atKey:!1,atRoot:!0,directives:c.directives,options:c.options,schema:c.schema},u=bp.resolveProps(i,{indicator:"doc-start",next:r??s?.[0],offset:t,onError:o,parentIndent:0,startOnNewline:!0});u.found&&(c.directives.docStart=!0,r&&(r.type==="block-map"||r.type==="block-seq")&&!u.hasNewline&&o(u.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),c.contents=r?_a.composeNode(l,r,u,o):_a.composeEmptyNode(l,u.end,i,null,u,o);let d=c.contents.range[2],f=yp.resolveEnd(s,d,!1,o);return f.comment&&(c.comment=f.comment),c.range=[t,d,f.offset],c}Na.composeDoc=Ep});var or=_(ka=>{"use strict";var Tp=It("process"),_p=Yn(),Np=gt(),_t=Et(),wa=C(),Sp=Sa(),wp=Xe();function Nt(n){if(typeof n=="number")return[n,n+1];if(Array.isArray(n))return n.length===2?n:[n[0],n[1]];let{offset:e,source:t}=n;return[e,e+(typeof t=="string"?t.length:1)]}function va(n){let e="",t=!1,i=!1;for(let r=0;r<n.length;++r){let s=n[r];switch(s[0]){case"#":e+=(e===""?"":i?`

`:`
`)+(s.substring(1)||" "),t=!0,i=!1;break;case"%":n[r+1]?.[0]!=="#"&&(r+=1),t=!1;break;default:t||(i=!0),t=!1}}return{comment:e,afterEmptyLine:i}}var sr=class{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(t,i,r,s)=>{let o=Nt(t);s?this.warnings.push(new _t.YAMLWarning(o,i,r)):this.errors.push(new _t.YAMLParseError(o,i,r))},this.directives=new _p.Directives({version:e.version||"1.2"}),this.options=e}decorate(e,t){let{comment:i,afterEmptyLine:r}=va(this.prelude);if(i){let s=e.contents;if(t)e.comment=e.comment?`${e.comment}
${i}`:i;else if(r||e.directives.docStart||!s)e.commentBefore=i;else if(wa.isCollection(s)&&!s.flow&&s.items.length>0){let o=s.items[0];wa.isPair(o)&&(o=o.key);let a=o.commentBefore;o.commentBefore=a?`${i}
${a}`:i}else{let o=s.commentBefore;s.commentBefore=o?`${i}
${o}`:i}}if(t){for(let s=0;s<this.errors.length;++s)e.errors.push(this.errors[s]);for(let s=0;s<this.warnings.length;++s)e.warnings.push(this.warnings[s])}else e.errors=this.errors,e.warnings=this.warnings;this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:va(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,t=!1,i=-1){for(let r of e)yield*this.next(r);yield*this.end(t,i)}*next(e){switch(Tp.env.LOG_STREAM&&console.dir(e,{depth:null}),e.type){case"directive":this.directives.add(e.source,(t,i,r)=>{let s=Nt(e);s[0]+=t,this.onError(s,"BAD_DIRECTIVE",i,r)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{let t=Sp.composeDoc(this.options,this.directives,e,this.onError);this.atDirectives&&!t.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(t,!1),this.doc&&(yield this.doc),this.doc=t,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{let t=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,i=new _t.YAMLParseError(Nt(e),"UNEXPECTED_TOKEN",t);this.atDirectives||!this.doc?this.errors.push(i):this.doc.errors.push(i);break}case"doc-end":{if(!this.doc){let i="Unexpected doc-end without preceding document";this.errors.push(new _t.YAMLParseError(Nt(e),"UNEXPECTED_TOKEN",i));break}this.doc.directives.docEnd=!0;let t=wp.resolveEnd(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),t.comment){let i=this.doc.comment;this.doc.comment=i?`${i}
${t.comment}`:t.comment}this.doc.range[2]=t.offset;break}default:this.errors.push(new _t.YAMLParseError(Nt(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,t=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){let i=Object.assign({_directives:this.directives},this.options),r=new Np.Document(void 0,i);this.atDirectives&&this.onError(t,"MISSING_CHAR","Missing directives-end indicator line"),r.range=[0,t,t],this.decorate(r,!1),yield r}}};ka.Composer=sr});var Oa=_(wn=>{"use strict";var vp=er(),kp=nr(),Ap=Et(),Aa=st();function Lp(n,e=!0,t){if(n){let i=(r,s,o)=>{let a=typeof r=="number"?r:Array.isArray(r)?r[0]:r.offset;if(t)t(a,s,o);else throw new Ap.YAMLParseError([a,a+1],s,o)};switch(n.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return kp.resolveFlowScalar(n,e,i);case"block-scalar":return vp.resolveBlockScalar({options:{strict:e}},n,i)}}return null}function Op(n,e){let{implicitKey:t=!1,indent:i,inFlow:r=!1,offset:s=-1,type:o="PLAIN"}=e,a=Aa.stringifyString({type:o,value:n},{implicitKey:t,indent:i>0?" ".repeat(i):"",inFlow:r,options:{blockQuote:!0,lineWidth:-1}}),c=e.end??[{type:"newline",offset:-1,indent:i,source:`
`}];switch(a[0]){case"|":case">":{let l=a.indexOf(`
`),u=a.substring(0,l),d=a.substring(l+1)+`
`,f=[{type:"block-scalar-header",offset:s,indent:i,source:u}];return La(f,c)||f.push({type:"newline",offset:-1,indent:i,source:`
`}),{type:"block-scalar",offset:s,indent:i,props:f,source:d}}case'"':return{type:"double-quoted-scalar",offset:s,indent:i,source:a,end:c};case"'":return{type:"single-quoted-scalar",offset:s,indent:i,source:a,end:c};default:return{type:"scalar",offset:s,indent:i,source:a,end:c}}}function Ip(n,e,t={}){let{afterKey:i=!1,implicitKey:r=!1,inFlow:s=!1,type:o}=t,a="indent"in n?n.indent:null;if(i&&typeof a=="number"&&(a+=2),!o)switch(n.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{let l=n.props[0];if(l.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=l.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}let c=Aa.stringifyString({type:o,value:e},{implicitKey:r||a===null,indent:a!==null&&a>0?" ".repeat(a):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}});switch(c[0]){case"|":case">":Rp(n,c);break;case'"':ar(n,c,"double-quoted-scalar");break;case"'":ar(n,c,"single-quoted-scalar");break;default:ar(n,c,"scalar")}}function Rp(n,e){let t=e.indexOf(`
`),i=e.substring(0,t),r=e.substring(t+1)+`
`;if(n.type==="block-scalar"){let s=n.props[0];if(s.type!=="block-scalar-header")throw new Error("Invalid block scalar header");s.source=i,n.source=r}else{let{offset:s}=n,o="indent"in n?n.indent:-1,a=[{type:"block-scalar-header",offset:s,indent:o,source:i}];La(a,"end"in n?n.end:void 0)||a.push({type:"newline",offset:-1,indent:o,source:`
`});for(let c of Object.keys(n))c!=="type"&&c!=="offset"&&delete n[c];Object.assign(n,{type:"block-scalar",indent:o,props:a,source:r})}}function La(n,e){if(e)for(let t of e)switch(t.type){case"space":case"comment":n.push(t);break;case"newline":return n.push(t),!0}return!1}function ar(n,e,t){switch(n.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":n.type=t,n.source=e;break;case"block-scalar":{let i=n.props.slice(1),r=e.length;n.props[0].type==="block-scalar-header"&&(r-=n.props[0].source.length);for(let s of i)s.offset+=r;delete n.props,Object.assign(n,{type:t,source:e,end:i});break}case"block-map":case"block-seq":{let r={type:"newline",offset:n.offset+e.length,indent:n.indent,source:`
`};delete n.items,Object.assign(n,{type:t,source:e,end:[r]});break}default:{let i="indent"in n?n.indent:-1,r="end"in n&&Array.isArray(n.end)?n.end.filter(s=>s.type==="space"||s.type==="comment"||s.type==="newline"):[];for(let s of Object.keys(n))s!=="type"&&s!=="offset"&&delete n[s];Object.assign(n,{type:t,indent:i,source:e,end:r})}}}wn.createScalarToken=Op;wn.resolveAsScalar=Lp;wn.setScalarValue=Ip});var Ra=_(Ia=>{"use strict";var xp=n=>"type"in n?kn(n):vn(n);function kn(n){switch(n.type){case"block-scalar":{let e="";for(let t of n.props)e+=kn(t);return e+n.source}case"block-map":case"block-seq":{let e="";for(let t of n.items)e+=vn(t);return e}case"flow-collection":{let e=n.start.source;for(let t of n.items)e+=vn(t);for(let t of n.end)e+=t.source;return e}case"document":{let e=vn(n);if(n.end)for(let t of n.end)e+=t.source;return e}default:{let e=n.source;if("end"in n&&n.end)for(let t of n.end)e+=t.source;return e}}}function vn({start:n,key:e,sep:t,value:i}){let r="";for(let s of n)r+=s.source;if(e&&(r+=kn(e)),t)for(let s of t)r+=s.source;return i&&(r+=kn(i)),r}Ia.stringify=xp});var Pa=_(Da=>{"use strict";var cr=Symbol("break visit"),Cp=Symbol("skip children"),xa=Symbol("remove item");function Ae(n,e){"type"in n&&n.type==="document"&&(n={start:n.start,value:n.value}),Ca(Object.freeze([]),n,e)}Ae.BREAK=cr;Ae.SKIP=Cp;Ae.REMOVE=xa;Ae.itemAtPath=(n,e)=>{let t=n;for(let[i,r]of e){let s=t?.[i];if(s&&"items"in s)t=s.items[r];else return}return t};Ae.parentCollection=(n,e)=>{let t=Ae.itemAtPath(n,e.slice(0,-1)),i=e[e.length-1][0],r=t?.[i];if(r&&"items"in r)return r;throw new Error("Parent collection not found")};function Ca(n,e,t){let i=t(e,n);if(typeof i=="symbol")return i;for(let r of["key","value"]){let s=e[r];if(s&&"items"in s){for(let o=0;o<s.items.length;++o){let a=Ca(Object.freeze(n.concat([[r,o]])),s.items[o],t);if(typeof a=="number")o=a-1;else{if(a===cr)return cr;a===xa&&(s.items.splice(o,1),o-=1)}}typeof i=="function"&&r==="key"&&(i=i(e,n))}}return typeof i=="function"?i(e,n):i}Da.visit=Ae});var An=_(G=>{"use strict";var lr=Oa(),Dp=Ra(),Pp=Pa(),dr="\uFEFF",fr="",ur="",pr="",qp=n=>!!n&&"items"in n,$p=n=>!!n&&(n.type==="scalar"||n.type==="single-quoted-scalar"||n.type==="double-quoted-scalar"||n.type==="block-scalar");function Mp(n){switch(n){case dr:return"<BOM>";case fr:return"<DOC>";case ur:return"<FLOW_END>";case pr:return"<SCALAR>";default:return JSON.stringify(n)}}function Up(n){switch(n){case dr:return"byte-order-mark";case fr:return"doc-mode";case ur:return"flow-error-end";case pr:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(n[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}G.createScalarToken=lr.createScalarToken;G.resolveAsScalar=lr.resolveAsScalar;G.setScalarValue=lr.setScalarValue;G.stringify=Dp.stringify;G.visit=Pp.visit;G.BOM=dr;G.DOCUMENT=fr;G.FLOW_END=ur;G.SCALAR=pr;G.isCollection=qp;G.isScalar=$p;G.prettyToken=Mp;G.tokenType=Up});var gr=_($a=>{"use strict";var St=An();function te(n){switch(n){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}var qa=new Set("0123456789ABCDEFabcdef"),Fp=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),Ln=new Set(",[]{}"),Bp=new Set(` ,[]{}
\r	`),hr=n=>!n||Bp.has(n),mr=class{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,t=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!t;let i=this.next??"stream";for(;i&&(t||this.hasChars(1));)i=yield*this.parseNext(i)}atLineEnd(){let e=this.pos,t=this.buffer[e];for(;t===" "||t==="	";)t=this.buffer[++e];return!t||t==="#"||t===`
`?!0:t==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let t=this.buffer[e];if(this.indentNext>0){let i=0;for(;t===" ";)t=this.buffer[++i+e];if(t==="\r"){let r=this.buffer[i+e+1];if(r===`
`||!r&&!this.atEnd)return e+i+1}return t===`
`||i>=this.indentNext||!t&&!this.atEnd?e+i:-1}if(t==="-"||t==="."){let i=this.buffer.substr(e,3);if((i==="---"||i==="...")&&te(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===St.BOM&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let t=e.length,i=e.indexOf("#");for(;i!==-1;){let s=e[i-1];if(s===" "||s==="	"){t=i-1;break}else i=e.indexOf("#",i+1)}for(;;){let s=e[t-1];if(s===" "||s==="	")t-=1;else break}let r=(yield*this.pushCount(t))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-r),this.pushNewline(),"stream"}if(this.atLineEnd()){let t=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-t),yield*this.pushNewline(),"stream"}return yield St.DOCUMENT,yield*this.parseLineStart()}*parseLineStart(){let e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");let t=this.peek(3);if((t==="---"||t==="...")&&te(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,t==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!te(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){let[e,t]=this.peek(2);if(!t&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&te(t)){let i=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=i,"block-start"}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);let e=this.getLine();if(e===null)return this.setNext("doc");let t=yield*this.pushIndicators();switch(e[t]){case"#":yield*this.pushCount(e.length-t);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(hr),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return t+=yield*this.parseBlockScalarHeader(),t+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-t),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,t,i=-1;do e=yield*this.pushNewline(),e>0?(t=yield*this.pushSpaces(!1),this.indentValue=i=t):t=0,t+=yield*this.pushSpaces(!0);while(e+t>0);let r=this.getLine();if(r===null)return this.setNext("flow");if((i!==-1&&i<this.indentNext&&r[0]!=="#"||i===0&&(r.startsWith("---")||r.startsWith("..."))&&te(r[3]))&&!(i===this.indentNext-1&&this.flowLevel===1&&(r[0]==="]"||r[0]==="}")))return this.flowLevel=0,yield St.FLOW_END,yield*this.parseLineStart();let s=0;for(;r[s]===",";)s+=yield*this.pushCount(1),s+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(s+=yield*this.pushIndicators(),r[s]){case void 0:return"flow";case"#":return yield*this.pushCount(r.length-s),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(hr),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{let o=this.charAt(1);if(this.flowKey||te(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){let e=this.charAt(0),t=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;t!==-1&&this.buffer[t+1]==="'";)t=this.buffer.indexOf("'",t+2);else for(;t!==-1;){let s=0;for(;this.buffer[t-1-s]==="\\";)s+=1;if(s%2===0)break;t=this.buffer.indexOf('"',t+1)}let i=this.buffer.substring(0,t),r=i.indexOf(`
`,this.pos);if(r!==-1){for(;r!==-1;){let s=this.continueScalar(r+1);if(s===-1)break;r=i.indexOf(`
`,s)}r!==-1&&(t=r-(i[r-1]==="\r"?2:1))}if(t===-1){if(!this.atEnd)return this.setNext("quoted-scalar");t=this.buffer.length}return yield*this.pushToIndex(t+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){let t=this.buffer[++e];if(t==="+")this.blockScalarKeep=!0;else if(t>"0"&&t<="9")this.blockScalarIndent=Number(t)-1;else if(t!=="-")break}return yield*this.pushUntil(t=>te(t)||t==="#")}*parseBlockScalar(){let e=this.pos-1,t=0,i;e:for(let s=this.pos;i=this.buffer[s];++s)switch(i){case" ":t+=1;break;case`
`:e=s,t=0;break;case"\r":{let o=this.buffer[s+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!i&&!this.atEnd)return this.setNext("block-scalar");if(t>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=t:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{let s=this.continueScalar(e+1);if(s===-1)break;e=this.buffer.indexOf(`
`,s)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let r=e+1;for(i=this.buffer[r];i===" ";)i=this.buffer[++r];if(i==="	"){for(;i==="	"||i===" "||i==="\r"||i===`
`;)i=this.buffer[++r];e=r-1}else if(!this.blockScalarKeep)do{let s=e-1,o=this.buffer[s];o==="\r"&&(o=this.buffer[--s]);let a=s;for(;o===" ";)o=this.buffer[--s];if(o===`
`&&s>=this.pos&&s+1+t>a)e=s;else break}while(!0);return yield St.SCALAR,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){let e=this.flowLevel>0,t=this.pos-1,i=this.pos-1,r;for(;r=this.buffer[++i];)if(r===":"){let s=this.buffer[i+1];if(te(s)||e&&Ln.has(s))break;t=i}else if(te(r)){let s=this.buffer[i+1];if(r==="\r"&&(s===`
`?(i+=1,r=`
`,s=this.buffer[i+1]):t=i),s==="#"||e&&Ln.has(s))break;if(r===`
`){let o=this.continueScalar(i+1);if(o===-1)break;i=Math.max(i,o-2)}}else{if(e&&Ln.has(r))break;t=i}return!r&&!this.atEnd?this.setNext("plain-scalar"):(yield St.SCALAR,yield*this.pushToIndex(t+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,t){let i=this.buffer.slice(this.pos,e);return i?(yield i,this.pos+=i.length,i.length):(t&&(yield""),0)}*pushIndicators(){let e=0;e:for(;;){switch(this.charAt(0)){case"!":e+=yield*this.pushTag(),e+=yield*this.pushSpaces(!0);continue e;case"&":e+=yield*this.pushUntil(hr),e+=yield*this.pushSpaces(!0);continue e;case"-":case"?":case":":{let t=this.flowLevel>0,i=this.charAt(1);if(te(i)||t&&Ln.has(i)){t?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,e+=yield*this.pushCount(1),e+=yield*this.pushSpaces(!0);continue e}}}break e}return e}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,t=this.buffer[e];for(;!te(t)&&t!==">";)t=this.buffer[++e];return yield*this.pushToIndex(t===">"?e+1:e,!1)}else{let e=this.pos+1,t=this.buffer[e];for(;t;)if(Fp.has(t))t=this.buffer[++e];else if(t==="%"&&qa.has(this.buffer[e+1])&&qa.has(this.buffer[e+2]))t=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){let e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let t=this.pos-1,i;do i=this.buffer[++t];while(i===" "||e&&i==="	");let r=t-this.pos;return r>0&&(yield this.buffer.substr(this.pos,r),this.pos=t),r}*pushUntil(e){let t=this.pos,i=this.buffer[t];for(;!e(i);)i=this.buffer[++t];return yield*this.pushToIndex(t,!1)}};$a.Lexer=mr});var br=_(Ma=>{"use strict";var yr=class{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let t=0,i=this.lineStarts.length;for(;t<i;){let s=t+i>>1;this.lineStarts[s]<e?t=s+1:i=s}if(this.lineStarts[t]===e)return{line:t+1,col:1};if(t===0)return{line:0,col:e};let r=this.lineStarts[t-1];return{line:t,col:e-r+1}}}};Ma.LineCounter=yr});var Tr=_(ja=>{"use strict";var Kp=It("process"),Ua=An(),jp=gr();function Ee(n,e){for(let t=0;t<n.length;++t)if(n[t].type===e)return!0;return!1}function Fa(n){for(let e=0;e<n.length;++e)switch(n[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function Ka(n){switch(n?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function On(n){switch(n.type){case"document":return n.start;case"block-map":{let e=n.items[n.items.length-1];return e.sep??e.start}case"block-seq":return n.items[n.items.length-1].start;default:return[]}}function Ye(n){if(n.length===0)return[];let e=n.length;e:for(;--e>=0;)switch(n[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;n[++e]?.type==="space";);return n.splice(e,n.length)}function In(n,e){if(e.length<1e5)Array.prototype.push.apply(n,e);else for(let t=0;t<e.length;++t)n.push(e[t])}function Ba(n){if(n.start.type==="flow-seq-start")for(let e of n.items)e.sep&&!e.value&&!Ee(e.start,"explicit-key-ind")&&!Ee(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,Ka(e.value)?e.value.end?In(e.value.end,e.sep):e.value.end=e.sep:In(e.start,e.sep),delete e.sep)}var Er=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new jp.Lexer,this.onNewLine=e}*parse(e,t=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(let i of this.lexer.lex(e,t))yield*this.next(i);t||(yield*this.end())}*next(e){if(this.source=e,Kp.env.LOG_TOKENS&&console.log("|",Ua.prettyToken(e)),this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}let t=Ua.tokenType(e);if(t)if(t==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=t,yield*this.step(),t){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{let i=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:i,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){let e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){let t=e??this.stack.pop();if(!t)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield t;else{let i=this.peek(1);switch(t.type==="block-scalar"?t.indent="indent"in i?i.indent:0:t.type==="flow-collection"&&i.type==="document"&&(t.indent=0),t.type==="flow-collection"&&Ba(t),i.type){case"document":i.value=t;break;case"block-scalar":i.props.push(t);break;case"block-map":{let r=i.items[i.items.length-1];if(r.value){i.items.push({start:[],key:t,sep:[]}),this.onKeyLine=!0;return}else if(r.sep)r.value=t;else{Object.assign(r,{key:t,sep:[]}),this.onKeyLine=!r.explicitKey;return}break}case"block-seq":{let r=i.items[i.items.length-1];r.value?i.items.push({start:[],value:t}):r.value=t;break}case"flow-collection":{let r=i.items[i.items.length-1];!r||r.value?i.items.push({start:[],key:t,sep:[]}):r.sep?r.value=t:Object.assign(r,{key:t,sep:[]});return}default:yield*this.pop(),yield*this.pop(t)}if((i.type==="document"||i.type==="block-map"||i.type==="block-seq")&&(t.type==="block-map"||t.type==="block-seq")){let r=t.items[t.items.length-1];r&&!r.sep&&!r.value&&r.start.length>0&&Fa(r.start)===-1&&(t.indent===0||r.start.every(s=>s.type!=="comment"||s.indent<t.indent))&&(i.type==="document"?i.end=r.start:i.items.push({start:r.start}),t.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{let e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{Fa(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}let t=this.startBlockValue(e);t?this.stack.push(t):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){let t=On(this.peek(2)),i=Ye(t),r;e.end?(r=e.end,r.push(this.sourceToken),delete e.end):r=[this.sourceToken];let s={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:i,key:e,sep:r}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=s}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,t.value){let i="end"in t.value?t.value.end:void 0;(Array.isArray(i)?i[i.length-1]:void 0)?.type==="comment"?i?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else if(t.sep)t.sep.push(this.sourceToken);else{if(this.atIndentedComment(t.start,e.indent)){let r=e.items[e.items.length-2]?.value?.end;if(Array.isArray(r)){In(r,t.start),r.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return}if(this.indent>=e.indent){let i=!this.onKeyLine&&this.indent===e.indent,r=i&&(t.sep||t.explicitKey)&&this.type!=="seq-item-ind",s=[];if(r&&t.sep&&!t.value){let o=[];for(let a=0;a<t.sep.length;++a){let c=t.sep[a];switch(c.type){case"newline":o.push(a);break;case"space":break;case"comment":c.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(s=t.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":r||t.value?(s.push(this.sourceToken),e.items.push({start:s}),this.onKeyLine=!0):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"explicit-key-ind":!t.sep&&!t.explicitKey?(t.start.push(this.sourceToken),t.explicitKey=!0):r||t.value?(s.push(this.sourceToken),e.items.push({start:s,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(t.explicitKey)if(t.sep)if(t.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Ee(t.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:s,key:null,sep:[this.sourceToken]}]});else if(Ka(t.key)&&!Ee(t.sep,"newline")){let o=Ye(t.start),a=t.key,c=t.sep;c.push(this.sourceToken),delete t.key,delete t.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:a,sep:c}]})}else s.length>0?t.sep=t.sep.concat(s,this.sourceToken):t.sep.push(this.sourceToken);else if(Ee(t.start,"newline"))Object.assign(t,{key:null,sep:[this.sourceToken]});else{let o=Ye(t.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else t.sep?t.value||r?e.items.push({start:s,key:null,sep:[this.sourceToken]}):Ee(t.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let o=this.flowScalar(this.type);r||t.value?(e.items.push({start:s,key:o,sep:[]}),this.onKeyLine=!0):t.sep?this.stack.push(o):(Object.assign(t,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{let o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!t.explicitKey&&t.sep&&!Ee(t.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else i&&e.items.push({start:s});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(t.value){let i="end"in t.value?t.value.end:void 0;(Array.isArray(i)?i[i.length-1]:void 0)?.type==="comment"?i?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(t.start,e.indent)){let r=e.items[e.items.length-2]?.value?.end;if(Array.isArray(r)){In(r,t.start),r.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return;case"anchor":case"tag":if(t.value||this.indent<=e.indent)break;t.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;t.value||Ee(t.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return}if(this.indent>e.indent){let i=this.startBlockValue(e);if(i){this.stack.push(i);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){let t=e.items[e.items.length-1];if(this.type==="flow-error-end"){let i;do yield*this.pop(),i=this.peek(1);while(i?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!t||t.sep?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return;case"map-value-ind":!t||t.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!t||t.value?e.items.push({start:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let r=this.flowScalar(this.type);!t||t.value?e.items.push({start:[],key:r,sep:[]}):t.sep?this.stack.push(r):Object.assign(t,{key:r,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}let i=this.startBlockValue(e);i?this.stack.push(i):(yield*this.pop(),yield*this.step())}else{let i=this.peek(2);if(i.type==="block-map"&&(this.type==="map-value-ind"&&i.indent===e.indent||this.type==="newline"&&!i.items[i.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&i.type!=="flow-collection"){let r=On(i),s=Ye(r);Ba(e);let o=e.end.splice(1,e.end.length);o.push(this.sourceToken);let a={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:s,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=a}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;let t=On(e),i=Ye(t);return i.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:i,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;let t=On(e),i=Ye(t);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:i,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,t){return this.type!=="comment"||this.indent<=t?!1:e.every(i=>i.type==="newline"||i.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};ja.Parser=Er});var Ga=_(vt=>{"use strict";var Xa=or(),Xp=gt(),wt=Et(),Yp=ri(),zp=C(),Vp=br(),Ya=Tr();function za(n){let e=n.prettyErrors!==!1;return{lineCounter:n.lineCounter||e&&new Vp.LineCounter||null,prettyErrors:e}}function Gp(n,e={}){let{lineCounter:t,prettyErrors:i}=za(e),r=new Ya.Parser(t?.addNewLine),s=new Xa.Composer(e),o=Array.from(s.compose(r.parse(n)));if(i&&t)for(let a of o)a.errors.forEach(wt.prettifyError(n,t)),a.warnings.forEach(wt.prettifyError(n,t));return o.length>0?o:Object.assign([],{empty:!0},s.streamInfo())}function Va(n,e={}){let{lineCounter:t,prettyErrors:i}=za(e),r=new Ya.Parser(t?.addNewLine),s=new Xa.Composer(e),o=null;for(let a of s.compose(r.parse(n),!0,n.length))if(!o)o=a;else if(o.options.logLevel!=="silent"){o.errors.push(new wt.YAMLParseError(a.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return i&&t&&(o.errors.forEach(wt.prettifyError(n,t)),o.warnings.forEach(wt.prettifyError(n,t))),o}function Jp(n,e,t){let i;typeof e=="function"?i=e:t===void 0&&e&&typeof e=="object"&&(t=e);let r=Va(n,t);if(!r)return null;if(r.warnings.forEach(s=>Yp.warn(r.options.logLevel,s)),r.errors.length>0){if(r.options.logLevel!=="silent")throw r.errors[0];r.errors=[]}return r.toJS(Object.assign({reviver:i},t))}function Hp(n,e,t){let i=null;if(typeof e=="function"||Array.isArray(e)?i=e:t===void 0&&e&&(t=e),typeof t=="string"&&(t=t.length),typeof t=="number"){let r=Math.round(t);t=r<1?void 0:r>8?{indent:8}:{indent:r}}if(n===void 0){let{keepUndefined:r}=t??e??{};if(!r)return}return zp.isDocument(n)&&!i?n.toString(t):new Xp.Document(n,i,t).toString(t)}vt.parse=Jp;vt.parseAllDocuments=Gp;vt.parseDocument=Va;vt.stringify=Hp});var Nr=_(P=>{"use strict";var Wp=or(),Qp=gt(),Zp=Fi(),_r=Et(),eh=et(),Te=C(),th=me(),nh=M(),ih=ye(),rh=be(),sh=An(),oh=gr(),ah=br(),ch=Tr(),Rn=Ga(),Ja=He();P.Composer=Wp.Composer;P.Document=Qp.Document;P.Schema=Zp.Schema;P.YAMLError=_r.YAMLError;P.YAMLParseError=_r.YAMLParseError;P.YAMLWarning=_r.YAMLWarning;P.Alias=eh.Alias;P.isAlias=Te.isAlias;P.isCollection=Te.isCollection;P.isDocument=Te.isDocument;P.isMap=Te.isMap;P.isNode=Te.isNode;P.isPair=Te.isPair;P.isScalar=Te.isScalar;P.isSeq=Te.isSeq;P.Pair=th.Pair;P.Scalar=nh.Scalar;P.YAMLMap=ih.YAMLMap;P.YAMLSeq=rh.YAMLSeq;P.CST=sh;P.Lexer=oh.Lexer;P.LineCounter=ah.LineCounter;P.Parser=ch.Parser;P.parse=Rn.parse;P.parseAllDocuments=Rn.parseAllDocuments;P.parseDocument=Rn.parseDocument;P.stringify=Rn.stringify;P.visit=Ja.visit;P.visitAsync=Ja.visitAsync});import{closeSync as om,existsSync as Mn,fsyncSync as am,mkdirSync as cm,openSync as lm,readFileSync as dm,readdirSync as fm,renameSync as Tc,rmSync as xr,statSync as wc,writeFileSync as um}from"node:fs";import{randomUUID as _c}from"node:crypto";import{dirname as Lt,join as z,resolve as ie}from"node:path";import{DatabaseSync as pm}from"node:sqlite";import{createHash as tl}from"node:crypto";var Rt=5,Kr=2,jr="0.5.0";function Q(n){let e=t=>Array.isArray(t)?t.map(e):t!==null&&typeof t=="object"?Object.fromEntries(Object.entries(t).filter(([,i])=>i!==void 0).sort(([i],[r])=>i.localeCompare(r)).map(([i,r])=>[i,e(r)])):t;return JSON.stringify(e(n))}function _e(n){return tl("sha256").update(Q(n)).digest("hex")}function Xr(n){return _e({projectRoot:n}).slice(0,24)}function Yr(n){let{zephyrRoot:e,projectRoot:t,...i}=n;return _e(i)}var zr=Rt,Vr=`
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
CREATE TABLE sample (
  id                    INTEGER PRIMARY KEY,
  path                  TEXT NOT NULL UNIQUE,
  name                  TEXT NOT NULL DEFAULT '',
  description           TEXT NOT NULL DEFAULT '',
  tags                  TEXT NOT NULL DEFAULT '[]',
  tags_text             TEXT NOT NULL DEFAULT '',
  depends_on            TEXT NOT NULL DEFAULT '[]',
  integration_platforms TEXT NOT NULL DEFAULT '[]',
  platform_allow        TEXT NOT NULL DEFAULT '[]',
  files                 TEXT NOT NULL DEFAULT '[]',
  doc_path              TEXT
);

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
  doc_anchor TEXT
);
CREATE INDEX api_symbol_name_idx ON api_symbol(name);
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
`,Gr=`
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
`;import{existsSync as Tl,mkdtempSync as _l,readFileSync as Nl,rmSync as Sl,writeFileSync as wl}from"node:fs";import{tmpdir as vl}from"node:os";import{join as De}from"node:path";import{spawnSync as kl}from"node:child_process";var Jr=`#!/usr/bin/env python3
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
                    enum_record["signature"] = enum_record["name"]
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
`;function il(n){return n.split(`
`).map(e=>e.replace(/^\s*\*\/?/,"").replace(/^ /,"")).join(`
`).trim()}function rl(n){let e={detail:"",params:[],returns:[],retvals:[],deprecated:!1},t=n.split(`
`),i=[],r={kind:"detail"},s=o=>{let a=o.trim();if(a)switch(r.kind){case"brief":e.brief=e.brief?`${e.brief} ${a}`:a;break;case"param":{let c=e.params[r.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}case"return":{let c=r.index;e.returns[c]=e.returns[c]?`${e.returns[c]} ${a}`:a;break}case"retval":{let c=e.retvals[r.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}default:i.push(a)}};for(let o of t){let a=o.trim();if(a===""){r.kind==="brief"?r={kind:"detail"}:r.kind==="detail"&&i.push("");continue}if(a==="@{"||a==="@}")continue;let c=a.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);if(!c){s(a);continue}let[,l="",u=""]=c,d=l.toLowerCase(),f=u.trim();switch(d){case"brief":case"short":r={kind:"brief"},s(f);break;case"param":{let h=f.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);if(h){let g={name:h[2],description:(h[3]??"").trim()};h[1]&&(g.direction=h[1].replace(/\s+/g,"")),e.params.push(g),r={kind:"param",index:e.params.length-1}}break}case"return":case"returns":case"result":e.returns.push(f),r={kind:"return",index:e.returns.length-1};break;case"retval":{let h=f.match(/^(\S+)\s*(.*)$/);h&&(e.retvals.push({value:h[1],description:(h[2]??"").trim()}),r={kind:"retval",index:e.retvals.length-1});break}case"defgroup":{let h=f.match(/^(\S+)\s*(.*)$/);h&&(e.defgroup={id:h[1],title:(h[2]??"").trim()}),r={kind:"detail"};break}case"addtogroup":e.addtogroup=f.split(/\s+/)[0],r={kind:"detail"};break;case"ingroup":e.ingroup=f.split(/\s+/)[0],r={kind:"detail"};break;case"since":e.since=f,r={kind:"detail"};break;case"deprecated":e.deprecated=!0,r={kind:"detail"},s(f);break;case"note":case"warning":case"details":case"remark":r={kind:"detail"},s(`${l.toUpperCase()}: ${f}`);break;case"version":case"name":case"file":case"cond":case"endcond":case"internal":case"endinternal":r={kind:"detail"};break;default:r={kind:"detail"},s(f);break}}e.detail=i.join(`
`).replace(/\n{3,}/g,`

`).trim(),e.brief&&(e.brief=Ve(e.brief)),e.detail=Ve(e.detail),e.returns=e.returns.map(Ve);for(let o of e.params)o.description=Ve(o.description);for(let o of e.retvals)o.description=Ve(o.description);return e}function Ve(n){return n.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g,"$1").replace(/[@\\]ref\s+(\S+)/g,"$1").replace(/[@\\]kconfig\{([^}]*)\}/g,"$1").replace(/[@\\]f\$/g,"").replace(/[ \t]{2,}/g," ").trim()}function sl(n){let e=[];for(let t of n.split(`
`)){let i=t.trim(),r=i.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);if(r){e.push({kind:"define",id:r[1],title:(r[2]??"").trim()});continue}let s=i.match(/^[@\\]addtogroup\s+(\S+)/);if(s){e.push({kind:"add",id:s[1]});continue}for(let o of i.matchAll(/[@\\]([{}])/g))e.push(o[1]==="{"?{kind:"open"}:{kind:"close"})}return e}function Ge(n){return n.replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").replace(/\s*,\s*/g,", ").trim()}var ol=["z_impl_"];function al(n){for(let e of ol)if(n.startsWith(e))return n.slice(e.length);return n}function cl(n){let e=n.trim();if(!e)return null;let t=e.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);if(t){let a=t[1],c=Ge(e.split(`
`)[0].replace(/\\$/,""));return{kind:"macro",name:a,signature:c}}let i=e.match(/^typedef\s+[\s\S]*?\(\s*\*\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/);if(i)return{kind:"typedef",name:i[1],signature:Ge(e)};let r=e.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);if(r)return{kind:"typedef",name:r[1],signature:Ge(e)};let s=e.match(/^(struct|union|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/);if(s)return{kind:s[1],name:s[2],signature:Ge(e.replace(/\{[\s\S]*$/,"").trim())};let o=e.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);if(o&&/^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(e)){let a=o[1];return a==="if"||a==="for"||a==="while"||a==="switch"?null:{kind:"function",name:al(a),signature:Ge(e.replace(/\s*\{[\s\S]*$/,"").replace(/;\s*$/,""))}}return null}function ll(n,e){let t=e,i=/^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;for(;t<n.length;){let o=n[t];if(o.trim()===""||i.test(o)){t++;continue}break}if(t>=n.length)return null;if(/^\s*#\s*define\b/.test(n[t])){let o=[],a=t;for(;a<n.length&&(o.push(n[a]),!!n[a].trimEnd().endsWith("\\"));)a++;return{text:o.join(`
`),line:t}}let r=[],s=0;for(let o=t;o<n.length&&o<t+40;o++){let a=n[o];r.push(a);for(let c of a)c==="("?s++:c===")"&&s--;if(s<=0&&(a.includes(";")||a.includes("{")))break}return{text:r.join(`
`),line:t}}function Hr(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),i=[],r=[],s=[];for(let o=0;o<t.length;o++){let a=t[o];if(!/\/\*\*|\/\*!/.test(a))continue;let c=[],l=o,u=!1;for(;l<t.length;l++)if(c.push(t[l]),t[l].includes("*/")){u=!0;break}if(!u)continue;let d=c.join(`
`).replace(/^[\s\S]*?\/\*[*!]/,"").replace(/\*\/[\s\S]*$/,""),f={text:il(d),endLine:l},h=rl(f.text),g=sl(f.text);if(g.length>0){let S;for(let w of g)switch(w.kind){case"define":{let k={id:w.id,title:w.title,header:e},v=h.ingroup??s[s.length-1];v&&(k.parent=v),r.push(k),S=w.id;break}case"add":S=w.id;break;case"open":s.push(S??s[s.length-1]??""),S=void 0;break;case"close":s.pop();break}if(!h.brief&&h.params.length===0&&h.retvals.length===0){o=l;continue}}let p=ll(t,l+1);if(!p){o=l;continue}let y=cl(p.text);if(!y){o=l;continue}let T=h.ingroup??s.filter(Boolean)[s.filter(Boolean).length-1],E={name:y.name,kind:y.kind,signature:y.signature,params:h.params,returns:h.returns,retvals:h.retvals,header:e,line:p.line+1,deprecated:h.deprecated};h.brief&&(E.brief=h.brief),h.detail&&(E.detail=h.detail),T&&(E.group=T),h.since&&(E.since=h.since),i.push(E),o=l}return{symbols:i,groups:r}}import{existsSync as xt,readFileSync as dl,realpathSync as fl}from"node:fs";import{delimiter as ul,join as Je,resolve as pl}from"node:path";import{spawnSync as Qr}from"node:child_process";function Wr(n,e){if(n.includes("/")||n.includes("\\"))return xt(n)?pl(n):void 0;for(let t of(e??"").split(ul).filter(Boolean)){let i=Je(t,n);if(xt(i))return i}}function hl(n){let e=Wr("west",n.PATH);if(e)try{let i=(dl(fl(e),"utf8").split(/\r?\n/,1)[0]??"").match(/^#!\s*(\S+)(?:\s+(.+))?$/);return i?i[1]?.endsWith("/env")&&i[2]?Wr(i[2].trim().split(/\s+/,1)[0],n.PATH):i[1]&&xt(i[1])?i[1]:void 0:void 0}catch{return}}function Zr(n){return[n.PYTHON_EXECUTABLE,hl(n),"python3","python"].filter((e,t,i)=>!!e&&i.indexOf(e)===t)}function es(n=process.env){for(let e of Zr(n))if(Qr(e,["-c","import sys; assert sys.version_info >= (3, 12)"],{encoding:"utf8",env:{...n,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return e;throw new Error("This index adapter requires Python 3.12 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.")}function xe(n,e=process.env){let t=Je(n,"scripts","kconfig"),i=Je(n,"scripts","dts","python-devicetree","src");if([Je(t,"kconfiglib.py"),Je(i,"devicetree","edtlib.py")].filter(a=>!xt(a)).length>0)throw new Error("The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry.");let s=Zr(e),o=["import sys",`sys.path.insert(0, ${JSON.stringify(t)})`,`sys.path.insert(0, ${JSON.stringify(i)})`,"import kconfiglib","import yaml","from devicetree import edtlib","assert sys.version_info >= (3, 12)"].join("; ");for(let a of s)if(Qr(a,["-c",o],{encoding:"utf8",env:{...e,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return a;throw new Error("Semantic index creation requires Python 3.12 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.")}import{existsSync as ml,readdirSync as gl}from"node:fs";import{join as yl,relative as bl,sep as ts}from"node:path";var El=new Set([".git","node_modules","__pycache__",".venv","build","twister-out"]);function*Z(n,e={}){if(!ml(n))return;let t=e.skipDirs??El,i=e.skipPrefixes??[],r=[n];for(;r.length>0;){let s=r.pop(),o;try{o=gl(s,{withFileTypes:!0})}catch(a){throw new Error(`Failed to read source directory ${s}: ${a instanceof Error?a.message:String(a)}`)}for(let a of o){let c=yl(s,a.name),l=Ce(bl(n,c));if(a.isDirectory()){if(t.has(a.name)||i.some(u=>l===u||l.startsWith(`${u}/`)))continue;r.push(c)}else if(a.isFile()){if(i.some(u=>l.startsWith(`${u}/`))||e.match&&!e.match(a.name))continue;yield l}else if(a.isSymbolicLink())throw new Error(`Refusing symbolic link in indexed source tree: ${c}`)}}}function Ce(n){return ts==="/"?n:n.split(ts).join("/")}function Al(n,e){if(!Tl(De(e,"index.xml")))throw new Error(`The Doxygen XML directory has no index.xml: ${e}`);let t=_l(De(vl(),"zephyr-ai-api-")),i=De(t,"api-export.py");try{wl(i,Jr,{mode:384});let r=kl(es(),[i,"--xml",e],{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(r.status!==0){let o=r.stderr?.trim()??"";try{let a=JSON.parse(r.stdout).report;if(a?.errors?.length){let c=a.errors.slice(0,8).map(u=>`- ${u.code}: ${u.message}${u.path?` (${u.path})`:""}`),l=a.errors.length-c.length;o=`${a.errors.length} error(s) in the Doxygen XML:
${c.join(`
`)}${l>0?`
- ... and ${l} more`:""}`}}catch{}throw new Error(`Doxygen XML export failed.
${o||"The exporter produced no diagnostic output."}`)}let s=JSON.parse(r.stdout);return s.symbols=s.symbols.map(o=>{let a=o.header.replaceAll("\\","/"),c="/include/zephyr/",l=a.lastIndexOf(c);return{...o,header:l>=0?`include/zephyr/${a.slice(l+c.length)}`:a}}),s}finally{Sl(t,{recursive:!0,force:!0})}}function ns(n,e){if(e)return Al(n,e);let t=De(n,"include","zephyr"),i=[],r=[],s=[];for(let a of Z(t,{skipPrefixes:["internal","arch/arm/internal"],match:c=>c.endsWith(".h")})){let c;try{c=Nl(De(t,a),"utf8")}catch(d){throw new Error(`Cannot read public API header ${De(t,a)}: ${d instanceof Error?d.message:String(d)}`)}let l=`include/zephyr/${a}`,u=Hr(c,l);for(let d of u.symbols){if(d.kind==="function"&&d.signature.includes("=")){s.push({path:`${l}:${d.line}`,reason:"fallback-initializer-artifact"});continue}let f=d.signature.indexOf("["),h=d.signature.indexOf("(");if(d.kind==="function"&&f>=0&&(h<0||f<h)){s.push({path:`${l}:${d.line}`,reason:"fallback-array-declarator-artifact"});continue}if(d.kind==="macro"&&/^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(d.signature)){s.push({path:`${l}:${d.line}`,reason:"fallback-include-guard"});continue}i.push(d)}r.push(...u.groups)}i.sort((a,c)=>a.name.localeCompare(c.name));let o=new Map;for(let a of r)(!o.has(a.id)||a.title&&!o.get(a.id).title)&&o.set(a.id,a);return{symbols:i,groups:[...o.values()],mode:"header-fallback",report:{discovered:i.length+o.size+s.length+1,indexed:i.length+o.size,intentionallyExcluded:[...s,{path:"include/zephyr/internal",reason:"private-header-policy"}],warnings:[{code:"header-fallback",message:"Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."}],errors:[]}}}import{existsSync as Ol,mkdtempSync as Il,rmSync as Rl,writeFileSync as xl}from"node:fs";import{tmpdir as Cl}from"node:os";import{dirname as rs,join as Bn}from"node:path";import{spawnSync as Dl}from"node:child_process";var is=`#!/usr/bin/env python3
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
`;var ss=new Map;function os(n){let e=JSON.stringify(n),t=ss.get(e);if(t)return t;if(n.length===0)throw new Error("At least one devicetree binding root is required.");let i=rs(rs(n[0])),r=Bn(i,"scripts","dts","python-devicetree","src","devicetree","edtlib.py");if(!Ol(r))throw new Error("The selected Zephyr tree does not provide its Python devicetree tooling.");let s=Il(Bn(Cl(),"zephyr-ai-bindings-")),o=Bn(s,"binding-export.py");try{xl(o,is,{mode:384});let a=[o,"--zephyr",i];for(let u of n)a.push("--root",u);let c=Dl(xe(i),a,{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(c.status!==0){let u="";try{u=(JSON.parse(c.stdout).report?.errors??[]).slice(0,12).map(h=>`${h.path??"<unknown>"} [${h.code}]: ${h.message}`).join(`
`)}catch{}let d=u||c.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`Zephyr devicetree binding export failed.
${d}`)}let l=JSON.parse(c.stdout);return ss.set(e,l),l}finally{Rl(s,{recursive:!0,force:!0})}}var Ha=Br(Nr(),1);import{existsSync as lh,readFileSync as dh,readdirSync as fh}from"node:fs";import{dirname as Sr,join as de}from"node:path";import{spawnSync as uh}from"node:child_process";function wr(n){try{let e=(0,Ha.parse)(dh(n,"utf8"),{logLevel:"silent"});if(!e||typeof e!="object"||Array.isArray(e))throw new Error("expected a YAML mapping");return e}catch(e){throw new Error(`Failed to parse board/SoC metadata ${n}: ${e.message}`)}}function ne(n){return Array.isArray(n)?n:[]}function kt(n){return ne(n).filter(e=>typeof e=="string")}function ph(n){let e=de(n,"scripts","list_boards.py");if(!lh(e))throw new Error("The selected Zephyr tree has no scripts/list_boards.py.");let t;for(let r of[process.env.PYTHON_EXECUTABLE,"python3","python"])if(r&&(t=uh(r,[e,"--board-root",n,"--soc-root",n,"--arch-root",n,"--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}"],{encoding:"utf8",maxBuffer:64*1024*1024}),!t.error||t.error.code!=="ENOENT"))break;if(!t||t.status!==0)throw new Error(`Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. The official board exporter failed: ${t?.stderr.trim()??"Python was not found."}`);let i=new Map;for(let r of t.stdout.split(`
`).filter(Boolean)){let s=r.split("@@").filter(Boolean).map(u=>u.split(";")),o=u=>s.find(([d])=>d===u)?.slice(1)??[],a=o("NAME")[0];if(!a)continue;let c={qualifiers:o("QUALIFIERS").filter(Boolean),revisions:o("REVISIONS").filter(Boolean)},l=o("REVISION_DEFAULT")[0];l&&l!=="NOTFOUND"&&(c.defaultRevision=l),i.set(a,c)}return i}function hh(n){let e=[],t;try{t=fh(n)}catch{return e}for(let i of t){if(!i.endsWith(".yaml")&&!i.endsWith(".yml")||i==="board.yml"||i==="board.yaml")continue;let r=wr(de(n,i)),s={toolchains:kt(r.toolchain),supported:kt(r.supported),...typeof r.name=="string"?{name:r.name}:{},...typeof r.arch=="string"?{arch:r.arch}:{},...typeof r.type=="string"?{type:r.type}:{},...typeof r.ram=="number"?{ram:r.ram}:{},...typeof r.flash=="number"?{flash:r.flash}:{},...typeof r.vendor=="string"?{vendor:r.vendor}:{}};typeof r.identifier=="string"&&e.push({identifier:r.identifier,...s});let o=r.variants&&typeof r.variants=="object"&&!Array.isArray(r.variants)?r.variants:{};for(let[a,c]of Object.entries(o)){let l=c&&typeof c=="object"&&!Array.isArray(c)?c:{};e.push({identifier:a,...s,toolchains:kt(l.toolchain).length?kt(l.toolchain):s.toolchains,supported:[...new Set([...s.supported,...kt(l.supported)])]})}}return e.sort((i,r)=>i.identifier.localeCompare(r.identifier)),e}function Wa(n){let e=[],t=ph(n);for(let i of Z(de(n,"boards"),{match:r=>r==="board.yml"||r==="board.yaml"})){let r=de(n,"boards",i),s=wr(r),o=[],a=s.board;a&&typeof a=="object"&&!Array.isArray(a)&&o.push(a);for(let g of ne(s.boards))g&&typeof g=="object"&&!Array.isArray(g)&&o.push(g);if(o.length===0)continue;let c=Sr(r),l=Ce(de("boards",Sr(i))),u=hh(c),d=[...Z(de(c,"doc"),{match:g=>g.endsWith(".rst")})],f=d.includes("index.rst")?"index.rst":d.sort()[0],h=f?`${l}/doc/${f}`:void 0;for(let g of o){if(typeof g.name!="string")continue;let p=g.name,y=ne(g.socs).flatMap(L=>{if(!L||typeof L!="object")return[];let K=L;return typeof K.name!="string"?[]:[{name:K.name,variants:ne(K.variants).flatMap(A=>A&&typeof A=="object"&&typeof A.name=="string"?[A.name]:[]),cpuclusters:ne(K.cpuclusters).flatMap(A=>A&&typeof A=="object"&&typeof A.name=="string"?[A.name]:[])}]}),T=u.filter(L=>L.identifier===p||L.identifier.startsWith(`${p}/`)),E=t.get(p);if(!E)throw new Error(`Zephyr's board model did not enumerate ${p}.`);let S=E.qualifiers.length>0?E.qualifiers:[""],w=S.map(L=>L?`${p}/${L}`:p);for(let L of E.revisions)w.push(...S.map(K=>K?`${p}@${L}/${K}`:`${p}@${L}`));let k=w.map(L=>({identifier:L,toolchains:[],supported:[]})),v=T.length>0?T:o.length===1?u:[],N=new Map(k.map(L=>[L.identifier,L]));for(let L of v){let K=N.get(L.identifier);N.set(L.identifier,K?{...K,...L}:L)}let b=[...N.values()].sort((L,K)=>L.identifier.localeCompare(K.identifier)),O={name:p,dir:l,socs:y,targets:b,revisions:E.revisions,supported:[...new Set(b.flatMap(L=>L.supported))].sort()};typeof g.full_name=="string"&&(O.fullName=g.full_name),typeof g.vendor=="string"&&(O.vendor=g.vendor),E.defaultRevision&&(O.defaultRevision=E.defaultRevision),h&&(O.docPath=h);let J=b.find(L=>L.arch)?.arch;J&&(O.arch=J);let B=b.find(L=>L.ram!==void 0)?.ram;B!==void 0&&(O.ram=B);let q=b.find(L=>L.flash!==void 0)?.flash;q!==void 0&&(O.flash=q),e.push(O)}}return e.sort((i,r)=>i.name.localeCompare(r.name)),e}function Qa(n){let e=[];for(let t of Z(de(n,"soc"),{match:i=>i==="soc.yml"||i==="soc.yaml"})){let i=de(n,"soc",t),r=wr(i),s=Ce(de("soc",Sr(t))),o=t.includes("/")?t.split("/")[0]:void 0,a=(l,u,d)=>{if(typeof l.name!="string")return;let f={name:l.name,dir:s,cpuclusters:ne(l.cpuclusters).flatMap(h=>h&&typeof h=="object"&&typeof h.name=="string"?[h.name]:[])};u&&(f.family=u),d&&(f.series=d),o&&(f.vendor=o),e.push(f)};(l=>{for(let u of l){if(!u||typeof u!="object")continue;let d=u,f=typeof d.name=="string"?d.name:void 0;for(let h of ne(d.socs))h&&typeof h=="object"&&a(h,f);for(let h of ne(d.series)){if(!h||typeof h!="object")continue;let g=h,p=typeof g.name=="string"?g.name:void 0;for(let y of ne(g.socs))y&&typeof y=="object"&&a(y,f,p)}}})(ne(r.family));for(let l of ne(r.socs))l&&typeof l=="object"&&a(l)}return e.sort((t,i)=>t.name.localeCompare(i.name)),e}import{existsSync as Th,lstatSync as _h,readFileSync as sc,realpathSync as Ar}from"node:fs";import{dirname as Nh,extname as Sh,join as tc,relative as Lr,resolve as wh,sep as nc}from"node:path";var mh="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";function xn(n){let e=n.trimEnd();if(e.length<2)return null;let t=e[0];if(!mh.includes(t))return null;for(let i of e)if(i!==t)return null;return{char:t,length:e.length}}function gh(n){let e=[];for(let t=0;t<n.length;t++){let i=xn(n[t]);if(!i)continue;let r=n[t-1];if(r===void 0)continue;let s=r.trim();if(s===""||i.length<s.length)continue;if(xn(r)){if(xn(n[t-2]??""))continue;continue}let o=xn(n[t-2]??""),a=o!==null&&o.char===i.char;e.push({line:t-1,text:s,char:i.char,overlined:a})}return e}function yh(n){let e=[];return n.map(t=>{let i=t.overlined?`over:${t.char}`:t.char,r=e.indexOf(i);return r===-1&&(r=e.length,e.push(i)),r})}var kr=/^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;function Za(n){let e=n.split(`
`),t=[],i=s=>t.push({code:!1,text:s}),r=new Set(["toctree","figure","image","only","contents","highlight","raw","graphviz","index","rst-class","sectionauthor","zephyr:board","zephyr:board-supported-hw","zephyr:board-supported-runners","zephyr:code-sample-category"]);for(let s=0;s<e.length;s++){let o=e[s];if(kr.test(o))continue;let a=o.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);if(a){let[,c="",l="",u=""]=a,d=c.length,f=l.toLowerCase(),h=[],g=s+1;for(;g<e.length;g++){let p=e[g];if(p.trim()===""){h.push("");continue}if(p.match(/^\s*/)[0].length<=d)break;h.push(p)}if(r.has(f)){s=g-1;continue}if(f==="code-block"||f==="code"||f==="literalinclude"){let p=u.trim(),y=vr(h).join(`
`).replace(/^\n+|\n+$/g,"");y&&t.push({code:!0,text:`\`\`\`${p}
${y}
\`\`\``}),s=g-1;continue}if(f==="note"||f==="warning"||f==="important"||f==="tip"){let p=vr(h).join(`
`).trim();p&&i(`${l.toUpperCase()}: ${p}`),s=g-1;continue}u.trim()&&i(u.trim());for(let p of vr(h))i(p);s=g-1;continue}/^\s*:[a-z-]+:\s*\S*\s*$/i.test(o)&&!o.includes(" ")||i(o)}return t.map(s=>s.code?s.text:bh(s.text)).join(`
`).replace(/\n{3,}/g,`

`).trim()}function vr(n){let e=n.filter(i=>i.trim()!=="").map(i=>i.match(/^\s*/)[0].length),t=e.length>0?Math.min(...e):0;return n.map(i=>i.trim()===""?"":i.slice(t))}function bh(n){return n.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi,"$1").replace(/:[a-z:+-]+:`([^`]*)`/gi,"$1").replace(/``([^`]+)``/g,"$1").replace(/`([^`]+)`__?/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\|([A-Za-z0-9_-]+)\|/g,"$1").replace(/::\s*$/gm,":")}function ec(n){let e=n.replace(/^﻿/,"").replace(/\r\n?/g,`
`),t=e.split(`
`),i=[];for(let l of t){let u=l.match(kr);u&&i.push(u[1].trim())}let r=gh(t),s=yh(r);if(r.length===0){let l=Za(e);return{title:"",labels:i,chunks:l?[{heading:"",headingPath:[],ord:0,body:l}]:[]}}let o=r[0].text,a=[],c=[];for(let l=0;l<r.length;l++){let u=r[l],d=s[l],f=r[l+1];for(;c.length>0&&c[c.length-1].level>=d;)c.pop();c.push({level:d,text:u.text});let h=u.line+2,g=f?f.line-(f.overlined?1:0):t.length,p=t.slice(h,Math.max(h,g)).join(`
`),y=Za(p),T=Eh(t,u.line-(u.overlined?1:0));(y||l===0)&&a.push({...T?{anchor:T}:{},heading:u.text,headingPath:c.map(E=>E.text),ord:a.length,body:y})}return{title:o,labels:i,chunks:a}}function Eh(n,e){for(let t=e-1;t>=0&&t>=e-4;t--){let i=n[t];if(i.trim()==="")continue;let r=i.match(kr);return r?r[1].trim():void 0}}var vh=new Set(["_build","_static","_scripts","_extensions","_templates","_doxygen","images","node_modules",".git"]);function kh(n,e){let t=n.replace(/\.rst$/,""),i=t.startsWith("doc/")?t.slice(4):t;return`${e.replace(/\/?$/,"/")}${i}.html`}function ic(n){let e=n.split("/"),t=e[e.length-1].replace(/\.rst$/,"");return t!=="index"?t.replace(/[_-]/g," "):(e[e.length-2]??t).replace(/[_-]/g," ")}function Ah(n){if(n.startsWith("boards/"))return"boards";let e=n.split("/");return e[0]==="doc"?e.length>2?e[1]:"index":e[0]??"other"}function Lh(n){let e=n.replace(/\r\n?/g,`
`).split(`
`),t=[];for(let i=0;i<e.length;i++){let r=e[i].match(/^(\s*)\.\.\s+toctree::\s*$/);if(!r)continue;let s=r[1].length;for(i+=1;i<e.length;i++){let o=e[i];if(o.trim()==="")continue;if(o.match(/^\s*/)[0].length<=s){i-=1;break}let c=o.trim();if(c.startsWith(":"))continue;let l=c.match(/^(.+?)\s*<([^>]+)>$/),u=(l?.[2]??c).replace(/\.rst$/,""),d=l?.[1]?.trim()||u.split("/").filter(Boolean).at(-1)?.replace(/^index$/,u.split("/").at(-2)??"index").replace(/[_-]/g," ");u&&d&&t.push(`${d} (${u})`)}}return[...new Set(t)]}function Oh(n){return Object.fromEntries(n.flatMap(e=>{let t=e.trim().match(/^:([a-z-]+):\s*(.*)$/i);return t?[[t[1],t[2]]]:[]}))}function Ih(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),i=1,r=t.length,s=Number(e["start-line"]),o=Number(e["end-line"]);Number.isInteger(s)&&s>=1&&(i=s),Number.isInteger(o)&&o>=i&&(r=Math.min(o,t.length));let a=e["start-after"]??e["start-at"];if(a){let l=t.findIndex(u=>u.includes(a));if(l<0)throw new Error(`start marker not found: ${a}`);i=l+(e["start-after"]?2:1)}let c=e["end-before"]??e["end-at"];if(c){let l=t.findIndex((u,d)=>d>=i-1&&u.includes(c));if(l<0)throw new Error(`end marker not found: ${c}`);r=l+(e["end-at"]?1:0)}return t=t.slice(i-1,r),{text:t.join(`
`),start:i,end:r}}function Or(n,e,t,i,r=[]){let s=Ar(e);if(r.includes(s))throw new Error(`include cycle: ${[...r,s].map(l=>Lr(n,l)).join(" -> ")}`);let o=[...r,s],a=t.replace(/\r\n?/g,`
`).split(`
`),c=[];for(let l=0;l<a.length;l++){let u=a[l],d=u.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);if(!d){c.push(u);continue}let f=d[1].length,h=d[2],g=d[3].trim(),p=[],y=l+1;for(;y<a.length;y++){let N=a[y];if(N.trim()===""){p.push(N);continue}if(N.match(/^\s*/)[0].length<=f)break;p.push(N)}if(l=y-1,h==="only"){if(/\bhtml\b/.test(g)){let N=p.map(O=>O.trim()?O.slice(Math.min(O.length,f+3)):""),b=Or(n,s,N.join(`
`),i,r);c.push(...b.split(`
`).map(O=>`${" ".repeat(f)}${O}`))}continue}let T=Oh(p),E=wh(Nh(s),g);if(!Th(E))throw new Error(`include target not found: ${g}`);if(_h(E).isSymbolicLink())throw new Error(`include target is a symbolic link: ${g}`);let S=Ar(n),w=Ar(E),k=Lr(S,w);if(k===".."||k.startsWith(`..${nc}`))throw new Error(`include escapes the Zephyr tree: ${g}`);let v=Ih(sc(w,"utf8"),T);if(i.push({path:Lr(S,w).replaceAll(nc,"/"),startLine:v.start,endLine:v.end,directive:h}),h==="literalinclude"){let N=T.language??Sh(E).slice(1);c.push(`${" ".repeat(f)}.. code-block:: ${N}`,"",...v.text.split(`
`).map(b=>`${" ".repeat(f+3)}${b}`))}else{let N=Or(S,w,v.text,i,o);c.push(...N.split(`
`).map(b=>`${" ".repeat(f)}${b}`))}}return c.join(`
`)}function rc(n,e,t,i){let r=[],s=tc(n,e);for(let o of Z(s,{skipDirs:vh,match:a=>a.endsWith(".rst")})){let a=`${e}/${o}`,c=tc(s,o);i.discovered++;try{let l=sc(c,"utf8"),u=[{path:a,startLine:1,endLine:l.split(/\r?\n/).length,directive:"page"}],d=Or(n,c,l,u),f=ec(d),h=f.chunks.filter(g=>g.body.trim()!=="").map((g,p)=>({...g,ord:p}));if(h.length===0){let g=Lh(d);if(g.length>0){let p=f.title||ic(a);h=[{heading:p,headingPath:[p],ord:0,body:`Contained documentation pages:
${g.map(y=>`- ${y}`).join(`
`)}`}]}}if(h.length===0){i.intentionallyExcluded.push({path:a,reason:"no-retrievable-content"});continue}r.push({path:a,url:kh(a,t),title:f.title||ic(a),area:Ah(a),labels:f.labels,chunks:h,origins:u}),i.indexed++}catch(l){i.errors.push({path:a,code:"rst-preprocess",message:l.message})}}return r}function oc(n,e){let t={discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]},i=[...rc(n,"doc",e,t),...rc(n,"boards",e,t)];if(t.errors.length>0){let r=t.errors.slice(0,12).map(s=>`${s.path}: ${s.message}`).join(`
`);throw new Error(`Documentation preprocessing failed for ${t.errors.length} source(s).
${r}`)}return{pages:i,report:t}}import{existsSync as xh,mkdtempSync as Ch,rmSync as Dh,writeFileSync as Ph}from"node:fs";import{tmpdir as qh}from"node:os";import{join as Cn}from"node:path";import{spawnSync as $h}from"node:child_process";var ac=`#!/usr/bin/env python3
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
`;var cc=new Map;function lc(n,e=[]){let t=JSON.stringify([n,[...e].sort()]),i=cc.get(t);if(i)return i;let r=Cn(n,"scripts","kconfig","kconfiglib.py");if(!xh(r))throw new Error("The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.");let s=Ch(Cn(qh(),"zephyr-ai-kconfig-")),o=Cn(s,"kconfig-export.py"),a=Cn(s,"generated");try{Ph(o,ac,{mode:384});let c=[o,"--zephyr",n,"--build-dir",a];for(let f of e)c.push("--module",f);let l=$h(xe(n),c,{cwd:n,encoding:"utf8",maxBuffer:256*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(l.status!==0){let f=l.stderr.trim().split(`
`).slice(-8).join(`
`);throw new Error(`Zephyr Kconfiglib export failed.
${f}`)}let u=JSON.parse(l.stdout),d={symbols:u.symbols,choices:u.choices,filesScanned:u.files.length,warnings:u.warnings};return cc.set(t,d),d}finally{Dh(s,{recursive:!0,force:!0})}}var uc=Br(Nr(),1);import{existsSync as Pn,readFileSync as fc,statSync as Mh}from"node:fs";import{dirname as dc,join as Le}from"node:path";var Uh=64*1024,Fh=160*1024;function pc(n){return/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|README\.rst)$/.test(n)?!0:/\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(n)&&/^(boards|snippets|src)\//.test(n)}function Bh(n,e){let t=[],i=[],r=Fh;for(let s of e){if(!pc(s))continue;let o=Le(n,s);try{if(Mh(o).size>Uh){i.push({path:s,reason:"file-size-limit"});continue}let a=fc(o,"utf8");if(Buffer.byteLength(a)>r){i.push({path:s,reason:"sample-size-budget"});continue}r-=Buffer.byteLength(a),t.push({path:s,text:a})}catch(a){throw new Error(`Failed to capture sample file ${o}: ${a.message}`)}}return{contents:t,exclusions:i}}function Kh(n){return Array.isArray(n)?n:typeof n=="string"?[n]:[]}function Dn(n){return Kh(n).filter(e=>typeof e=="string")}function jh(n){let e=[],t=i=>{Pn(Le(n,i))&&e.push(i)};for(let i of["sample.yaml","prj.conf","CMakeLists.txt","Kconfig","sysbuild.conf","README.rst"])t(i);for(let i of["src","boards","snippets"]){let r=Le(n,i);if(Pn(r))try{e.push(...[...Z(r,{match:s=>pc(`${i}/${s}`)})].map(s=>`${i}/${s}`))}catch{}}return e}function hc(n){let e=[],t=new Set;for(let i of["samples","snippets"]){let r=Le(n,i);if(Pn(r))for(let s of Z(r,{match:o=>o==="sample.yaml"})){let o=Le(r,s),a=null;try{let N=(0,uc.parse)(fc(o,"utf8"),{logLevel:"silent"});if(!N||typeof N!="object"||Array.isArray(N))throw new Error("expected a YAML mapping");a=N}catch(N){throw new Error(`Failed to parse sample metadata ${s}: ${N.message}`)}let c=dc(o),l=Ce(Le(i,dc(s)));if(t.has(l))continue;t.add(l);let u=a.sample&&typeof a.sample=="object"?a.sample:{},d=a.tests&&typeof a.tests=="object"?a.tests:{},f=a.common&&typeof a.common=="object"&&!Array.isArray(a.common)?a.common:{},h=new Set,g=new Set,p=new Set,y=new Set,T=N=>{for(let b of Dn(N.tags))h.add(b);if(typeof N.tags=="string")for(let b of N.tags.split(/\s+/).filter(Boolean))h.add(b);for(let b of Dn(N.depends_on))g.add(b);for(let b of Dn(N.integration_platforms))p.add(b);for(let b of Dn(N.platform_allow))y.add(b)};T(f);for(let N of Object.values(d))!N||typeof N!="object"||T({...f,...N});let E=jh(c),{contents:S,exclusions:w}=Bh(c,E),k=S.map(N=>N.path),v={path:l,name:typeof u.name=="string"?u.name:l.split("/").pop(),tags:[...h].sort(),dependsOn:[...g].sort(),integrationPlatforms:[...p].sort(),platformAllow:[...y].sort(),files:k,contents:S,exclusions:w};typeof u.description=="string"&&(v.description=u.description),Pn(Le(c,"README.rst"))&&(v.docPath=`${l}/README.rst`),e.push(v)}}return e.sort((i,r)=>i.path.localeCompare(r.path)),e}import{createHash as Rr}from"node:crypto";import{existsSync as $n,readFileSync as qn,realpathSync as At,statSync as Qh}from"node:fs";import{basename as gc,dirname as Zh,join as Oe,relative as em,resolve as tm}from"node:path";import{spawnSync as bc}from"node:child_process";import{createHash as Xh}from"node:crypto";import{existsSync as Yh,lstatSync as zh,readFileSync as Vh,readlinkSync as Gh,realpathSync as Jh}from"node:fs";import{join as Hh}from"node:path";import{spawnSync as Wh}from"node:child_process";function Ir(n,e){let t=Wh("git",["-C",n,...e],{encoding:"utf8",maxBuffer:268435456,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function mc(n){let e=Jh(n),t=Ir(e,["rev-parse","HEAD"]);if(!t)return null;let i=Ir(e,["diff","--binary","HEAD"])??"",r=(Ir(e,["ls-files","--others","--exclude-standard"])??"").split(`
`).filter(s=>!!s&&s!==".zephyr-ai-managed.json").sort().map(s=>{let o=Hh(e,s);if(!Yh(o))return{path:s,missing:!0};try{let a=zh(o);return a.isSymbolicLink()?{path:s,symlink:Gh(o)}:a.isFile()?{path:s,sha256:Xh("sha256").update(Vh(o)).digest("hex")}:{path:s,special:a.mode}}catch{return{path:s,unreadable:!0}}});return{commit:t,dirty:!!(i||r.length),stateFingerprint:_e({commit:t,diff:i,untracked:r})}}function nm(n,e){let t=bc("git",["-C",n,...e],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function im(n){let e=qn(Oe(n,"VERSION"),"utf8"),t=s=>e.match(new RegExp(`^${s}\\s*=\\s*(.*)$`,"m"))?.[1]?.trim()??"",i=[t("VERSION_MAJOR"),t("VERSION_MINOR"),t("PATCHLEVEL")].join("."),r=t("EXTRAVERSION");return r?`${i}-${r}`:i}function rm(n){let e=tm(n);for(;;){if($n(Oe(e,".west","config")))return e;let t=Zh(e);if(t===e)return;e=t}}function sm(n){if(!n)return;let e=bc("west",["manifest","--freeze"],{cwd:n,encoding:"utf8",stdio:["ignore","pipe","ignore"]});if(e.status===0&&e.stdout.trim())return Rr("sha256").update(e.stdout).digest("hex");let t="",i="west.yml";try{let o=qn(Oe(n,".west","config"),"utf8");t=o.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim()??"",i=o.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim()??i}catch{}let s=[...t?[Oe(n,t,i)]:[],Oe(n,"west.yml"),Oe(n,"west.yaml")].find($n);return s?Rr("sha256").update(qn(s)).digest("hex"):void 0}function yc(n){let e=At(n),t=mc(e);if(t)return{name:gc(e),...t};let i=["VERSION","west.yml","zephyr/module.yml","module.yml"].map(r=>Oe(e,r)).filter($n).map(r=>{let s=Qh(r);return{path:em(e,r),bytes:s.size,sha256:Rr("sha256").update(qn(r)).digest("hex")}});return{name:gc(e),markers:i}}function Ec(n){let e=At(n.zephyrRoot),t=n.projectRoot&&$n(n.projectRoot)?At(n.projectRoot):void 0,i=nm(e,["rev-parse","HEAD"]);if(!i)throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${e}.`);let r=rm(t??e),s=sm(r),o=n.modules.map(f=>yc(f)),a=_e(o),c=yc(e),l=String(c.stateFingerprint??_e(c)),u=n.pinnedCommit===i&&c.dirty===!1?"pinned-upstream":r?"west-workspace":"explicit-tree",d={descriptorVersion:Kr,schemaVersion:Rt,builderVersion:jr,sourceKind:u,...t?{projectRoot:t}:{},zephyrRoot:e,zephyrVersion:im(e),zephyrCommit:i,zephyrTreeFingerprint:l,...s?{westManifestHash:s}:{},moduleFingerprint:a,...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:At(n.applicationRoot)}:{},...n.buildDirectory?{buildDirectory:At(n.buildDirectory)}:{},coverage:{docs:{complete:n.modules.length===0,note:n.modules.length?"Module documentation is not indexed.":void 0},kconfig:{complete:!1,note:"Catalogue index; generated and application-local symbols require resolved context."},bindings:{complete:n.modules.length===0&&!t&&!n.applicationRoot,note:n.modules.length||t||n.applicationRoot?"Application-local or undisclosed module binding roots may not be indexed.":void 0},boards:{complete:n.modules.length===0,note:n.modules.length?"Module board roots are not indexed.":void 0},samples:{complete:n.modules.length===0,note:n.modules.length?"Module samples are not indexed.":void 0},api:{complete:!!n.apiSemantic&&n.modules.length===0,note:n.apiSemantic?n.modules.length?"Module public headers are not indexed.":void 0:"Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."},resolvedBuild:{complete:!1,note:n.buildDirectory?"Build identity is recorded, but resolved .config and final devicetree values are not ingested.":"No resolved build output was supplied or ingested."}}};return{...d,createdAt:new Date().toISOString(),contextFingerprint:Yr(d)}}function hm(n){let e=ie(process.cwd()),t={zephyr:process.env.ZEPHYR_BASE??z(e,".cache","zephyr"),modules:[],quiet:!1,requireDoxygen:!1,requirePinned:!1,projectRoot:process.env.CLAUDE_PROJECT_DIR??process.env.ZEPHYR_AI_PROJECT_ROOT,pluginData:process.env.CLAUDE_PLUGIN_DATA??process.env.ZEPHYR_AI_PLUGIN_DATA};for(let i=0;i<n.length;i++){let r=n[i];switch(r){case"--zephyr":t.zephyr=ie(n[++i]);break;case"--out":t.out=ie(n[++i]);break;case"--project-root":t.projectRoot=ie(n[++i]);break;case"--plugin-data":t.pluginData=ie(n[++i]);break;case"--board":t.boardTarget=n[++i];break;case"--application":t.applicationRoot=ie(n[++i]);break;case"--build-dir":t.buildDirectory=ie(n[++i]);break;case"--api-xml":t.apiXml=ie(n[++i]);break;case"--require-doxygen":t.requireDoxygen=!0;break;case"--require-pinned":t.requirePinned=!0;break;case"--modules":t.modules.push(ie(n[++i]));break;case"--quiet":case"-q":t.quiet=!0;break;case"--help":case"-h":console.log("Usage: zephyr-ai-ingest [--zephyr <path>] [--project-root <path>] [--out <path>] [--modules <path>]... [--board <target>] [--application <path>] [--build-dir <path>] [--api-xml <dir>] [--require-doxygen] [--require-pinned] [--quiet]"),process.exit(0);break;default:throw new Error(`Unknown argument: ${r}`)}}return t.zephyr=ie(t.zephyr),t}function mm(){for(let n of[z(process.cwd(),"zephyr.lock.json"),z(process.cwd(),"..","..","zephyr.lock.json")])try{return JSON.parse(dm(n,"utf8"))}catch{}return{}}function Nc(n){return n===void 0?null:JSON.stringify(n)}function Cr(n){let e=lm(n,"r");try{am(e)}finally{om(e)}}function Sc(n){try{Cr(n)}catch{}}function gm(n,e){let t=fm(n,{withFileTypes:!0}).filter(r=>r.isDirectory()&&/^[a-f0-9]{64}$/.test(r.name)).flatMap(r=>{let s=z(n,r.name),o=z(s,"zephyr.db");if(!Mn(o))return[];let a=z(s,"last-used");return[{fingerprint:r.name,directory:s,usedAt:wc(Mn(a)?a:o).mtimeMs}]}).sort((r,s)=>s.usedAt-r.usedAt),i=new Set([e,...t.filter(r=>r.fingerprint!==e).slice(0,4).map(r=>r.fingerprint)]);for(let r of t)i.has(r.fingerprint)||xr(r.directory,{recursive:!0,force:!0})}function ym(){let n=hm(process.argv.slice(2)),e=X=>{n.quiet||process.stderr.write(`${X}
`)};if(!Mn(z(n.zephyr,"VERSION")))throw new Error(`${n.zephyr} does not look like a Zephyr tree (no VERSION file).
Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`);xe(n.zephyr);let t=mm();if(n.requireDoxygen&&!n.apiXml)throw new Error("Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.");let i=Ec({zephyrRoot:n.zephyr,...n.projectRoot?{projectRoot:n.projectRoot}:{},modules:n.modules,...t.commit?{pinnedCommit:t.commit}:{},...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:n.applicationRoot}:{},...n.buildDirectory?{buildDirectory:n.buildDirectory}:{},apiSemantic:!!n.apiXml}),r=i.zephyrVersion;if(n.requirePinned&&(!t.commit||i.sourceKind!=="pinned-upstream"))throw new Error(`The requested pinned index build requires commit ${t.commit??"<missing lock>"}, but the selected tree is ${i.zephyrCommit}. The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit --require-pinned for an explicit workspace index.`);let s=`https://docs.zephyrproject.org/${r}/`,o,a=n.out;if(!a&&n.pluginData)if(i.projectRoot){let X=z(n.pluginData,"indexes","projects",Xr(i.projectRoot));a=z(X,i.contextFingerprint,"zephyr.db"),o=z(X,"active.json")}else a=z(n.pluginData,"indexes","defaults",i.zephyrCommit,String(i.schemaVersion),"zephyr.db");a??=z(ie(process.cwd()),"index","zephyr.db"),e(`Indexing Zephyr ${r} from ${n.zephyr}`);let c=Date.now(),l=Date.now(),{pages:u,report:d}=oc(n.zephyr,s),f=u.reduce((X,ae)=>X+ae.chunks.length,0);e(`  docs      ${u.length} pages, ${f} sections (${Date.now()-l} ms)`);let h=Date.now(),g=lc(n.zephyr,n.modules);e(`  kconfig   ${g.symbols.length} symbols from ${g.filesScanned} files (${Date.now()-h} ms)`);let p=Date.now(),y=[z(n.zephyr,"dts","bindings"),...n.modules.map(X=>z(X,"dts","bindings")).filter(Mn)],{bindings:T,fragments:E,report:S}=os(y),w=X=>X.properties.length+X.children.reduce((ae,Un)=>ae+w(Un),0),k=T.reduce((X,ae)=>X+w(ae),0);e(`  bindings  ${T.length} compatibles, ${k} properties, ${E} fragments (${Date.now()-p} ms)`);let v=Date.now(),N=Wa(n.zephyr),b=Qa(n.zephyr),O=N.reduce((X,ae)=>X+ae.targets.length,0);e(`  boards    ${N.length} boards, ${O} targets, ${b.length} SoCs (${Date.now()-v} ms)`);let J=Date.now(),B=hc(n.zephyr);e(`  samples   ${B.length} (${Date.now()-J} ms)`);let q=Date.now(),L=ns(n.zephyr,n.apiXml);e(`  api       ${L.symbols.length} symbols, ${L.groups.length} groups, ${L.mode} (${Date.now()-q} ms)`),cm(Lt(a),{recursive:!0});let K=z(Lt(a),`.${_c()}.zephyr.db.tmp`),A,Dr=!1;try{A=new pm(K),A.exec(Vr);let X=Date.now();A.exec("BEGIN");let ae=A.prepare("INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)"),Un=A.prepare(`INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`),vc=A.prepare("INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)");for(let m of u){let x=ae.run(m.path,m.url,m.title,m.area,JSON.stringify(m.labels)),I=Number(x.lastInsertRowid);for(let R of m.origins)vc.run(I,R.path,R.startLine,R.endLine,R.directive);for(let R of m.chunks)Un.run(I,R.anchor??null,R.heading,R.headingPath.join(" > "),R.ord,m.title,R.body)}let kc=A.prepare(`INSERT INTO kconfig
       (name, type, prompt, help, defaults, depends, selects, implies, ranges,
        defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Fn=A.prepare("INSERT INTO kconfig_edge (from_sym, to_sym, kind) VALUES (?, ?, ?)"),Ot=new Map;for(let m of g.symbols){let x=m.definitions.flatMap(D=>D.defaults.map($=>({value:$.value.display,...$.condition.display!=="y"?{cond:$.condition.display}:{}}))),I=m.definitions.map(D=>D.condition.display).filter((D,$,Gc)=>D!=="y"&&Gc.indexOf(D)===$),R=m.definitions.flatMap(D=>D.selects.map($=>({value:$.target,...$.condition.display!=="y"?{cond:$.condition.display}:{}}))),j=m.definitions.flatMap(D=>D.implies.map($=>({value:$.target,...$.condition.display!=="y"?{cond:$.condition.display}:{}}))),ze=m.definitions.flatMap(D=>D.ranges.map($=>({low:$.low.display,high:$.high.display,...$.condition.display!=="y"?{cond:$.condition.display}:{}}))),H=m.definitions.find(D=>D.prompt)?.prompt??"",Ie=m.definitions.find(D=>D.menuPath.length>0)?.menuPath.join(" > ")??"",U=kc.run(m.name,m.type??null,H,m.help??"",JSON.stringify(x),JSON.stringify(I),JSON.stringify(R),JSON.stringify(j),JSON.stringify(ze),JSON.stringify(m.definitions.map(D=>({file:D.file,line:D.line}))),Ie,m.choice?1:0,m.choice??null,m.definitions.length,m.hasPrompt?1:0);Ot.set(m.name,Number(U.lastInsertRowid));for(let D of R)Fn.run(m.name,D.value,"select");for(let D of j)Fn.run(m.name,D.value,"imply");let Re=D=>[...D.kind==="symbol"&&D.value?[D.value]:[],...(D.children??[]).flatMap(Re)];for(let D of m.definitions)for(let $ of Re(D.condition))Fn.run(m.name,$,"depends")}let Ac=A.prepare("INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)"),Pr=new Map,re=m=>{if(!m)return null;let x=Q(m),I=Pr.get(x);if(I!==void 0)return I;let R=m.children??[],j=Number(Ac.run(m.kind,m.value??null,m.display,re(R[0]??null),re(R[1]??null)).lastInsertRowid);return Pr.set(x,j),j},Lc=A.prepare(`INSERT INTO kconfig_definition
       (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
        is_menuconfig, is_configdefault)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),Oc=A.prepare(`INSERT INTO kconfig_default
       (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`),Ic=A.prepare(`INSERT INTO kconfig_relation
       (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
     VALUES (?, ?, ?, ?, ?, ?)`),Rc=A.prepare(`INSERT INTO kconfig_range
       (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
     VALUES (?, ?, ?, ?, ?)`);for(let m of g.symbols){let x=Ot.get(m.name);for(let I of m.definitions){let R=Number(Lc.run(x,I.file,I.line,I.prompt,JSON.stringify(I.menuPath),re(I.condition),re(I.promptCondition),I.isMenuconfig?1:0,I.isConfigDefault?1:0).lastInsertRowid);for(let j of I.defaults)Oc.run(R,re(j.value),re(j.condition),j.order);for(let[j,ze]of[["select",I.selects],["imply",I.implies]])for(let H of ze)Ic.run(R,j,H.target,Ot.get(H.target)??null,re(H.condition),H.order);for(let j of I.ranges)Rc.run(R,re(j.low),re(j.high),re(j.condition),j.order)}}let xc=A.prepare("INSERT INTO kconfig_choice (stable_id, name, type, definitions) VALUES (?, ?, ?, ?)"),Cc=A.prepare("INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)");for(let m of g.choices){let x=Number(xc.run(m.id,m.name,m.type,JSON.stringify(m.definitions)).lastInsertRowid);for(let I of new Set(m.members)){let R=Ot.get(I);R!==void 0&&Cc.run(x,R)}}let Dc=A.prepare(`INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Pc=A.prepare(`INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),qc=A.prepare("INSERT INTO text_pool (text) VALUES (?)"),qr=new Map,$c=m=>{if(!m)return null;let x=qr.get(m);if(x!==void 0)return x;let I=Number(qc.run(m).lastInsertRowid);return qr.set(m,I),I};for(let m of T){let x=m.compatible,I=(H,Ie=0,U="")=>[...H.properties.map(Re=>({level:Ie,childPath:U,property:Re})),...H.children.flatMap((Re,D)=>I(Re,Ie+1,U?`${U}/${D}`:String(D)))],R=I(m),j=Dc.run(x,m.path,m.description??"",m.bus===void 0?null:typeof m.bus=="string"?m.bus:JSON.stringify(m.bus),m.onBus??null,JSON.stringify(m.cells),JSON.stringify(m.includes),R.map(({property:H})=>H.name).join(" "),R.length,x.includes(",")?x.split(",")[0]:null),ze=Number(j.lastInsertRowid);for(let{level:H,childPath:Ie,property:U}of R)Pc.run(ze,H,U.name,U.type??null,U.required?1:0,$c(U.description),Nc(U.default),U.enum===void 0?null:JSON.stringify(U.enum),Nc(U.const),U.deprecated?1:0,U.specifierSpace??null,U.inheritedFrom??null,JSON.stringify(U.provenance??{}),JSON.stringify(U.constraints??{}),Ie)}let Mc=A.prepare(`INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let m of N){let x=m.socs.map(I=>I.name);Mc.run(m.name,m.fullName??"",m.vendor??"",m.dir,m.arch??null,m.ram??null,m.flash??null,JSON.stringify(m.socs),x.join(" "),JSON.stringify(m.targets),m.targets.map(I=>I.identifier).join(" "),JSON.stringify(m.revisions),m.defaultRevision??null,JSON.stringify(m.supported),m.supported.join(" "),m.docPath??null)}let Uc=A.prepare("INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)");for(let m of b)Uc.run(m.name,m.series??null,m.family??null,m.vendor??null,m.dir,JSON.stringify(m.cpuclusters));let Fc=A.prepare(`INSERT INTO sample
       (path, name, description, tags, tags_text, depends_on, integration_platforms,
        platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Bc=A.prepare("INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)"),$r=A.prepare("INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)");for(let m of B){let x=Fc.run(m.path,m.name,m.description??"",JSON.stringify(m.tags),m.tags.join(" "),JSON.stringify(m.dependsOn),JSON.stringify(m.integrationPlatforms),JSON.stringify(m.platformAllow),JSON.stringify(m.files),m.docPath??null),I=Number(x.lastInsertRowid);for(let R of m.contents)Bc.run(I,R.path,R.text);for(let R of m.integrationPlatforms)$r.run(I,R,"integration");for(let R of m.platformAllow)$r.run(I,R,"allowlist")}let Kc=A.prepare(`INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let m of L.symbols)Kc.run(m.name,m.kind,m.signature,m.brief??"",m.detail??"",JSON.stringify(m.params),JSON.stringify(m.returns),JSON.stringify(m.retvals),m.group??null,m.since??null,m.deprecated?1:0,m.header,m.line,m.doxygenId??null,m.compoundId??null,m.docAnchor??null);let jc=A.prepare("INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)");for(let m of L.groups)jc.run(m.id,m.title,m.parent??null,m.header);let Xc=A.prepare("INSERT INTO meta (key, value) VALUES (?, ?)"),Yc={schema_version:String(zr),zephyr_version:r,zephyr_commit:i.zephyrCommit,zephyr_tag:i.sourceKind==="pinned-upstream"?t.tag??"":"",source_path:n.zephyr,source_kind:i.sourceKind,index_descriptor:Q(i),context_fingerprint:i.contextFingerprint,module_fingerprint:i.moduleFingerprint,doc_base_url:s,built_at:new Date().toISOString(),ingest_version:"0.1.0",count_docs:String(u.length),count_doc_chunks:String(f),report_docs:Q(d),count_kconfig:String(g.symbols.length),report_kconfig:Q({discovered:g.symbols.length+g.choices.length,indexed:g.symbols.length+g.choices.length,intentionallyExcluded:[],warnings:[{code:"source-files",message:`Kconfiglib evaluated ${g.filesScanned} source files.`},...g.warnings.map(m=>({code:"kconfiglib",message:m}))],errors:[]}),count_bindings:String(T.length),count_dt_properties:String(k),report_bindings:Q(S),count_boards:String(N.length),count_board_targets:String(O),count_socs:String(b.length),report_boards:Q({discovered:N.length+O+b.length,indexed:N.length+O+b.length,intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts include board, target, and SoC records."}],errors:[]}),count_samples:String(B.length),report_samples:Q({discovered:B.length+B.reduce((m,x)=>m+x.contents.length+x.exclusions.length,0),indexed:B.length+B.reduce((m,x)=>m+x.contents.length,0),intentionallyExcluded:B.flatMap(m=>m.exclusions.map(x=>({path:`${m.path}/${x.path}`,reason:x.reason}))),warnings:[{code:"report-units",message:"Counts include sample records and eligible attached files."}],errors:[]}),count_api:String(L.symbols.length),api_ingest_mode:L.mode,report_api:Q(L.report)};for(let[m,x]of Object.entries(Yc))Xc.run(m,x);A.exec("COMMIT"),e(`  written   (${Date.now()-X} ms)`);let zc=Date.now();A.exec(Gr),e(`  indexed   full-text (${Date.now()-zc} ms)`),A.exec("VACUUM"),A.exec("PRAGMA optimize");let Mr=String(A.prepare("PRAGMA integrity_check").get()?.integrity_check??""),Ur=A.prepare("PRAGMA foreign_key_check").all();if(Mr!=="ok"||Ur.length>0)throw new Error(`Index verification failed (integrity=${Mr}, foreign-key violations=${Ur.length}).`);for(let[m,x]of[["doc_fts","doc_chunk"],["kconfig_fts","kconfig"],["dt_fts","dt_binding"],["board_fts","board"],["sample_fts","sample"],["api_fts","api_symbol"]]){let I=Number(A.prepare(`SELECT COUNT(*) AS n FROM ${m}`).get()?.n),R=Number(A.prepare(`SELECT COUNT(*) AS n FROM ${x}`).get()?.n);if(I!==R)throw new Error(`Index verification failed: ${m} has ${I} rows; ${x} has ${R}.`)}if(A.close(),A=void 0,Cr(K),Tc(K,a),Sc(Lt(a)),Dr=!0,o){let m=`${o}.${_c()}.tmp`;um(m,`${Q({contextFingerprint:i.contextFingerprint,relativePath:`${i.contextFingerprint}/zephyr.db`,activatedAt:new Date().toISOString()})}
`,{flag:"wx"}),Cr(m),Tc(m,o),Sc(Lt(o)),gm(Lt(o),i.contextFingerprint)}let Vc=wc(a).size;e(`Done in ${((Date.now()-c)/1e3).toFixed(1)} s -> ${a} (${(Vc/1024/1024).toFixed(1)} MiB)`)}finally{try{A?.close()}catch{}Dr||(xr(K,{force:!0}),xr(`${K}-journal`,{force:!0}))}}try{ym()}catch(n){process.stderr.write(`zephyr-ai-ingest: ${n.message}
`),process.exit(1)}
