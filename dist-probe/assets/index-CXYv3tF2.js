(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1e3,t=1001,n=1002,r=1003,i=1004,a=1005,o=1006,s=1007,c=1008,l=1009,u=1010,d=1011,f=1012,p=1013,m=1014,h=1015,g=1016,_=1017,v=1018,y=1020,b=35902,x=35899,S=1021,C=1022,w=1023,T=1026,E=1027,D=1028,O=1029,k=1030,A=1031,ee=1033,j=33776,te=33777,M=33778,ne=33779,N=35840,re=35841,P=35842,ie=35843,ae=36196,oe=37492,se=37496,ce=37488,F=37489,le=37490,ue=37491,de=37808,fe=37809,pe=37810,me=37811,he=37812,ge=37813,_e=37814,ve=37815,ye=37816,be=37817,xe=37818,Se=37819,Ce=37820,we=37821,Te=36492,Ee=36494,De=36495,Oe=36283,ke=36284,Ae=36285,je=36286,Me=2300,I=2301,Ne=2302,Pe=2303,Fe=2400,L=2401,Ie=2402,R=3200,Le=`srgb`,z=`srgb-linear`,Re=`linear`,ze=`srgb`,Be=7680,Ve=35044,He=35048,Ue=2e3;function We(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ge(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Ke(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function qe(){let e=Ke(`canvas`);return e.style.display=`block`,e}var Je={};function Ye(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Xe(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function B(...e){e=Xe(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function V(...e){e=Xe(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Ze(...e){let t=e.join(` `);t in Je||(Je[t]=!0,B(...e))}function Qe(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var $e={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},et=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},tt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),nt=1234567,rt=Math.PI/180,it=180/Math.PI;function at(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(tt[e&255]+tt[e>>8&255]+tt[e>>16&255]+tt[e>>24&255]+`-`+tt[t&255]+tt[t>>8&255]+`-`+tt[t>>16&15|64]+tt[t>>24&255]+`-`+tt[n&63|128]+tt[n>>8&255]+`-`+tt[n>>16&255]+tt[n>>24&255]+tt[r&255]+tt[r>>8&255]+tt[r>>16&255]+tt[r>>24&255]).toLowerCase()}function H(e,t,n){return Math.max(t,Math.min(n,e))}function ot(e,t){return(e%t+t)%t}function st(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function ct(e,t,n){return e===t?0:(n-e)/(t-e)}function lt(e,t,n){return(1-n)*e+n*t}function ut(e,t,n,r){return lt(e,t,1-Math.exp(-n*r))}function dt(e,t=1){return t-Math.abs(ot(e,t*2)-t)}function ft(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function pt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function mt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function ht(e,t){return e+Math.random()*(t-e)}function gt(e){return e*(.5-Math.random())}function _t(e){e!==void 0&&(nt=e);let t=nt+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function vt(e){return e*rt}function yt(e){return e*it}function bt(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function xt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function St(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Ct(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:B(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function wt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function Tt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var Et={DEG2RAD:rt,RAD2DEG:it,generateUUID:at,clamp:H,euclideanModulo:ot,mapLinear:st,inverseLerp:ct,lerp:lt,damp:ut,pingpong:dt,smoothstep:ft,smootherstep:pt,randInt:mt,randFloat:ht,randFloatSpread:gt,seededRandom:_t,degToRad:vt,radToDeg:yt,isPowerOfTwo:bt,ceilPowerOfTwo:xt,floorPowerOfTwo:St,setQuaternionFromProperEuler:Ct,normalize:Tt,denormalize:wt},U=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Dt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:B(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(H(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(kt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(kt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ot.copy(this).projectOnVector(e),this.sub(Ot)}reflect(e){return this.sub(Ot.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ot=new W,kt=new Dt,G=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Ze(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(At.makeScale(e,t)),this}rotate(e){return Ze(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(At.makeRotation(-e)),this}translate(e,t){return Ze(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(At.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},At=new G,jt=new G().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mt=new G().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Nt(){let e={enabled:!0,workingColorSpace:z,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Pt(e.r),e.g=Pt(e.g),e.b=Pt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Ft(e.r),e.g=Ft(e.g),e.b=Ft(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Re:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Ze(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Ze(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[z]:{primaries:t,whitePoint:r,transfer:Re,toXYZ:jt,fromXYZ:Mt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Le},outputColorSpaceConfig:{drawingBufferColorSpace:Le}},[Le]:{primaries:t,whitePoint:r,transfer:ze,toXYZ:jt,fromXYZ:Mt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Le}}}),e}var K=Nt();function Pt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Ft(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var It,Lt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{It===void 0&&(It=Ke(`canvas`)),It.width=e.width,It.height=e.height;let t=It.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=It}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ke(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Pt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Pt(t[e]/255)*255):t[e]=Pt(t[e]);return{data:t,width:e.width,height:e.height}}return B(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Rt=0,zt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Rt++}),this.uuid=at(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Bt(r[t].image)):e.push(Bt(r[t]))}else e=Bt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Bt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Lt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(B(`Texture: Unable to serialize Texture.`),{})}var Vt=0,Ht=new W,Ut=class r extends et{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,i=t,a=t,s=o,u=c,d=w,f=l,p=r.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Vt++}),this.uuid=at(),this.name=``,this.source=new zt(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new U(0,0),this.repeat=new U(1,1),this.center=new U(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new G,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ht).x}get height(){return this.source.getSize(Ht).y}get depth(){return this.source.getSize(Ht).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){B(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){B(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x)}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y)}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ut.DEFAULT_IMAGE=null,Ut.DEFAULT_MAPPING=300,Ut.DEFAULT_ANISOTROPY=1;var Wt=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this.w=H(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this.w=H(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Gt=class extends et{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:o,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Wt(0,0,e,t),this.scissorTest=!1,this.viewport=new Wt(0,0,e,t),this.textures=[];let r=new Ut({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:o,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new zt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Kt=class extends Gt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},qt=class extends Ut{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Jt=class extends Ut{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},q=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Yt.setFromMatrixColumn(e,0).length(),i=1/Yt.setFromMatrixColumn(e,1).length(),a=1/Yt.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Zt,e,Qt)}lookAt(e,t,n){let r=this.elements;return tn.subVectors(e,t),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),$t.crossVectors(n,tn),$t.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),$t.crossVectors(n,tn)),$t.normalize(),en.crossVectors(tn,$t),r[0]=$t.x,r[4]=en.x,r[8]=tn.x,r[1]=$t.y,r[5]=en.y,r[9]=tn.y,r[2]=$t.z,r[6]=en.z,r[10]=tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],j=r[14],te=r[3],M=r[7],ne=r[11],N=r[15];return i[0]=a*x+o*T+s*k+c*te,i[4]=a*S+o*E+s*A+c*M,i[8]=a*C+o*D+s*ee+c*ne,i[12]=a*w+o*O+s*j+c*N,i[1]=l*x+u*T+d*k+f*te,i[5]=l*S+u*E+d*A+f*M,i[9]=l*C+u*D+d*ee+f*ne,i[13]=l*w+u*O+d*j+f*N,i[2]=p*x+m*T+h*k+g*te,i[6]=p*S+m*E+h*A+g*M,i[10]=p*C+m*D+h*ee+g*ne,i[14]=p*w+m*O+h*j+g*N,i[3]=_*x+v*T+y*k+b*te,i[7]=_*S+v*E+y*A+b*M,i[11]=_*C+v*D+y*ee+b*ne,i[15]=_*w+v*O+y*j+b*N,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Yt.set(r[0],r[1],r[2]).length(),o=Yt.set(r[4],r[5],r[6]).length(),s=Yt.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Xt.copy(this);let c=1/a,l=1/o,u=1/s;return Xt.elements[0]*=c,Xt.elements[1]*=c,Xt.elements[2]*=c,Xt.elements[4]*=l,Xt.elements[5]*=l,Xt.elements[6]*=l,Xt.elements[8]*=u,Xt.elements[9]*=u,Xt.elements[10]*=u,t.setFromRotationMatrix(Xt),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Ue,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ue,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Yt=new W,Xt=new q,Zt=new W(0,0,0),Qt=new W(1,1,1),$t=new W,en=new W,tn=new W,nn=new q,rn=new Dt,an=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(H(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-H(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(H(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-H(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(H(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-H(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:B(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return nn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(nn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return rn.setFromEuler(this),this.setFromQuaternion(rn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};an.DEFAULT_ORDER=`XYZ`;var on=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},sn=0,cn=new W,ln=new Dt,un=new q,dn=new W,fn=new W,pn=new W,mn=new Dt,hn=new W(1,0,0),gn=new W(0,1,0),_n=new W(0,0,1),vn={type:`added`},yn={type:`removed`},bn={type:`childadded`,child:null},xn={type:`childremoved`,child:null},Sn=class e extends et{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:sn++}),this.uuid=at(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new W,n=new an,r=new Dt,i=new W(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new q},normalMatrix:{value:new G}}),this.matrix=new q,this.matrixWorld=new q,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new on,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ln.setFromAxisAngle(e,t),this.quaternion.multiply(ln),this}rotateOnWorldAxis(e,t){return ln.setFromAxisAngle(e,t),this.quaternion.premultiply(ln),this}rotateX(e){return this.rotateOnAxis(hn,e)}rotateY(e){return this.rotateOnAxis(gn,e)}rotateZ(e){return this.rotateOnAxis(_n,e)}translateOnAxis(e,t){return cn.copy(e).applyQuaternion(this.quaternion),this.position.add(cn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(hn,e)}translateY(e){return this.translateOnAxis(gn,e)}translateZ(e){return this.translateOnAxis(_n,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(un.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?dn.copy(e):dn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),fn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?un.lookAt(fn,dn,this.up):un.lookAt(dn,fn,this.up),this.quaternion.setFromRotationMatrix(un),r&&(un.extractRotation(r.matrixWorld),ln.setFromRotationMatrix(un),this.quaternion.premultiply(ln.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(V(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(vn),bn.child=e,this.dispatchEvent(bn),bn.child=null):V(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(yn),xn.child=e,this.dispatchEvent(xn),xn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),un.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),un.multiply(e.parent.matrixWorld)),e.applyMatrix4(un),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(vn),bn.child=e,this.dispatchEvent(bn),bn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fn,e,pn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fn,mn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};Sn.DEFAULT_UP=new W(0,1,0),Sn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Sn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Cn=class extends Sn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},wn={type:`move`},Tn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Cn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Cn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Cn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(wn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Cn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},En={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Dn={h:0,s:0,l:0},On={h:0,s:0,l:0};function kn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var J=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Le){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,K.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=K.workingColorSpace){return this.r=e,this.g=t,this.b=n,K.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=K.workingColorSpace){if(e=ot(e,1),t=H(t,0,1),n=H(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=kn(i,r,e+1/3),this.g=kn(i,r,e),this.b=kn(i,r,e-1/3)}return K.colorSpaceToWorking(this,r),this}setStyle(e,t=Le){function n(t){t!==void 0&&parseFloat(t)<1&&B(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:B(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);B(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Le){let n=En[e.toLowerCase()];return n===void 0?B(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Pt(e.r),this.g=Pt(e.g),this.b=Pt(e.b),this}copyLinearToSRGB(e){return this.r=Ft(e.r),this.g=Ft(e.g),this.b=Ft(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Le){return K.workingToColorSpace(An.copy(this),e),Math.round(H(An.r*255,0,255))*65536+Math.round(H(An.g*255,0,255))*256+Math.round(H(An.b*255,0,255))}getHexString(e=Le){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=K.workingColorSpace){K.workingToColorSpace(An.copy(this),t);let n=An.r,r=An.g,i=An.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=K.workingColorSpace){return K.workingToColorSpace(An.copy(this),t),e.r=An.r,e.g=An.g,e.b=An.b,e}getStyle(e=Le){K.workingToColorSpace(An.copy(this),e);let t=An.r,n=An.g,r=An.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Dn),this.setHSL(Dn.h+e,Dn.s+t,Dn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Dn),e.getHSL(On);let n=lt(Dn.h,On.h,t),r=lt(Dn.s,On.s,t),i=lt(Dn.l,On.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},An=new J;J.NAMES=En;var jn=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new J(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},Mn=class extends Sn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new an,this.environmentIntensity=1,this.environmentRotation=new an,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Nn=new W,Pn=new W,Fn=new W,In=new W,Ln=new W,Rn=new W,zn=new W,Bn=new W,Vn=new W,Hn=new W,Un=new Wt,Wn=new Wt,Gn=new Wt,Kn=class e{constructor(e=new W,t=new W,n=new W){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Nn.subVectors(e,t),r.cross(Nn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Nn.subVectors(r,t),Pn.subVectors(n,t),Fn.subVectors(e,t);let a=Nn.dot(Nn),o=Nn.dot(Pn),s=Nn.dot(Fn),c=Pn.dot(Pn),l=Pn.dot(Fn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,In)!==null&&In.x>=0&&In.y>=0&&In.x+In.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,In)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,In.x),s.addScaledVector(a,In.y),s.addScaledVector(o,In.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Un.setScalar(0),Wn.setScalar(0),Gn.setScalar(0),Un.fromBufferAttribute(e,t),Wn.fromBufferAttribute(e,n),Gn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Un,i.x),a.addScaledVector(Wn,i.y),a.addScaledVector(Gn,i.z),a}static isFrontFacing(e,t,n,r){return Nn.subVectors(n,t),Pn.subVectors(e,t),Nn.cross(Pn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Nn.subVectors(this.c,this.b),Pn.subVectors(this.a,this.b),Nn.cross(Pn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Ln.subVectors(r,n),Rn.subVectors(i,n),Bn.subVectors(e,n);let s=Ln.dot(Bn),c=Rn.dot(Bn);if(s<=0&&c<=0)return t.copy(n);Vn.subVectors(e,r);let l=Ln.dot(Vn),u=Rn.dot(Vn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Ln,a);Hn.subVectors(e,i);let f=Ln.dot(Hn),p=Rn.dot(Hn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Rn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return zn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(zn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Ln,a).addScaledVector(Rn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},qn=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Yn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Yn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Yn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Yn):Yn.fromBufferAttribute(r,t),Yn.applyMatrix4(e.matrixWorld),this.expandByPoint(Yn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Xn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Xn.copy(e.boundingBox)),Xn.applyMatrix4(e.matrixWorld),this.union(Xn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Yn),Yn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(rr),ir.subVectors(this.max,rr),Zn.subVectors(e.a,rr),Qn.subVectors(e.b,rr),$n.subVectors(e.c,rr),er.subVectors(Qn,Zn),tr.subVectors($n,Qn),nr.subVectors(Zn,$n);let t=[0,-er.z,er.y,0,-tr.z,tr.y,0,-nr.z,nr.y,er.z,0,-er.x,tr.z,0,-tr.x,nr.z,0,-nr.x,-er.y,er.x,0,-tr.y,tr.x,0,-nr.y,nr.x,0];return!sr(t,Zn,Qn,$n,ir)||(t=[1,0,0,0,1,0,0,0,1],!sr(t,Zn,Qn,$n,ir))?!1:(ar.crossVectors(er,tr),t=[ar.x,ar.y,ar.z],sr(t,Zn,Qn,$n,ir))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Yn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Yn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Jn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Jn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Jn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Jn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Jn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Jn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Jn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Jn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Jn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Jn=[new W,new W,new W,new W,new W,new W,new W,new W],Yn=new W,Xn=new qn,Zn=new W,Qn=new W,$n=new W,er=new W,tr=new W,nr=new W,rr=new W,ir=new W,ar=new W,or=new W;function sr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){or.fromArray(e,a);let o=i.x*Math.abs(or.x)+i.y*Math.abs(or.y)+i.z*Math.abs(or.z),s=t.dot(or),c=n.dot(or),l=r.dot(or);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var cr=new W,lr=new U,ur=0,Y=class extends et{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ur++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Ve,this.updateRanges=[],this.gpuType=h,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)lr.fromBufferAttribute(this,t),lr.applyMatrix3(e),this.setXY(t,lr.x,lr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)cr.fromBufferAttribute(this,t),cr.applyMatrix3(e),this.setXYZ(t,cr.x,cr.y,cr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)cr.fromBufferAttribute(this,t),cr.applyMatrix4(e),this.setXYZ(t,cr.x,cr.y,cr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)cr.fromBufferAttribute(this,t),cr.applyNormalMatrix(e),this.setXYZ(t,cr.x,cr.y,cr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)cr.fromBufferAttribute(this,t),cr.transformDirection(e),this.setXYZ(t,cr.x,cr.y,cr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=wt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=wt(t,this.array)),t}setX(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=wt(t,this.array)),t}setY(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=wt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=wt(t,this.array)),t}setW(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array),i=Tt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},dr=class extends Y{constructor(e,t,n){super(new Uint16Array(e),t,n)}},fr=class extends Y{constructor(e,t,n){super(new Uint32Array(e),t,n)}},pr=class extends Y{constructor(e,t,n){super(new Float32Array(e),t,n)}},mr=new qn,hr=new W,gr=new W,_r=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?mr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;hr.subVectors(e,this.center);let t=hr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(hr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(gr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(hr.copy(e.center).add(gr)),this.expandByPoint(hr.copy(e.center).sub(gr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},vr=0,yr=new q,br=new Sn,xr=new W,Sr=new qn,Cr=new qn,wr=new W,Tr=class e extends et{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:vr++}),this.uuid=at(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(We(e)?fr:dr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new G().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return yr.makeRotationFromQuaternion(e),this.applyMatrix4(yr),this}rotateX(e){return yr.makeRotationX(e),this.applyMatrix4(yr),this}rotateY(e){return yr.makeRotationY(e),this.applyMatrix4(yr),this}rotateZ(e){return yr.makeRotationZ(e),this.applyMatrix4(yr),this}translate(e,t,n){return yr.makeTranslation(e,t,n),this.applyMatrix4(yr),this}scale(e,t,n){return yr.makeScale(e,t,n),this.applyMatrix4(yr),this}lookAt(e){return br.lookAt(e),br.updateMatrix(),this.applyMatrix4(br.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xr).negate(),this.translate(xr.x,xr.y,xr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new pr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&B(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){V(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Sr.setFromBufferAttribute(n),this.morphTargetsRelative?(wr.addVectors(this.boundingBox.min,Sr.min),this.boundingBox.expandByPoint(wr),wr.addVectors(this.boundingBox.max,Sr.max),this.boundingBox.expandByPoint(wr)):(this.boundingBox.expandByPoint(Sr.min),this.boundingBox.expandByPoint(Sr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&V(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new _r);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){V(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new W,1/0);return}if(e){let n=this.boundingSphere.center;if(Sr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Cr.setFromBufferAttribute(n),this.morphTargetsRelative?(wr.addVectors(Sr.min,Cr.min),Sr.expandByPoint(wr),wr.addVectors(Sr.max,Cr.max),Sr.expandByPoint(wr)):(Sr.expandByPoint(Cr.min),Sr.expandByPoint(Cr.max))}Sr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)wr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(wr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)wr.fromBufferAttribute(a,t),o&&(xr.fromBufferAttribute(e,t),wr.add(xr)),r=Math.max(r,n.distanceToSquared(wr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&V(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){V(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Y(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new W,s[e]=new W;let c=new W,l=new W,u=new W,d=new U,f=new U,p=new U,m=new W,h=new W;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new W,y=new W,b=new W,x=new W;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Y(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new W,i=new W,a=new W,o=new W,s=new W,c=new W,l=new W,u=new W;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)wr.fromBufferAttribute(e,t),wr.normalize(),e.setXYZ(t,wr.x,wr.y,wr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Y(a,r,i)}if(this.index===null)return B(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Er=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Ve,this.updateRanges=[],this.version=0,this.uuid=at()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=at()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=at()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Dr=new W,Or=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.applyMatrix4(e),this.setXYZ(t,Dr.x,Dr.y,Dr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.applyNormalMatrix(e),this.setXYZ(t,Dr.x,Dr.y,Dr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.transformDirection(e),this.setXYZ(t,Dr.x,Dr.y,Dr.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=wt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Tt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=wt(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=wt(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=wt(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=wt(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array),i=Tt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Ye(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Y(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ye(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},kr=new W,Ar=new W,jr=new G,Mr=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=kr.subVectors(n,t).cross(Ar.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(kr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||jr.getNormalMatrix(e),r=this.coplanarPoint(kr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Nr=0,Pr=class extends et{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Nr++}),this.uuid=at(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new J(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Be,this.stencilZFail=Be,this.stencilZPass=Be,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){B(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){B(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new J().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Mr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new U().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new U().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Fr=class extends Pr{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new J(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ir,Lr=new W,Rr=new W,zr=new W,Br=new U,Vr=new U,Hr=new q,Ur=new W,Wr=new W,Gr=new W,Kr=new U,qr=new U,Jr=new U,Yr=class extends Sn{constructor(e=new Fr){if(super(),this.isSprite=!0,this.type=`Sprite`,Ir===void 0){Ir=new Tr;let e=new Er(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Ir.setIndex([0,1,2,0,2,3]),Ir.setAttribute(`position`,new Or(e,3,0,!1)),Ir.setAttribute(`uv`,new Or(e,2,3,!1))}this.geometry=Ir,this.material=e,this.center=new U(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&V(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Rr.setFromMatrixScale(this.matrixWorld),Hr.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),zr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Rr.multiplyScalar(-zr.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Xr(Ur.set(-.5,-.5,0),zr,a,Rr,r,i),Xr(Wr.set(.5,-.5,0),zr,a,Rr,r,i),Xr(Gr.set(.5,.5,0),zr,a,Rr,r,i),Kr.set(0,0),qr.set(1,0),Jr.set(1,1);let o=e.ray.intersectTriangle(Ur,Wr,Gr,!1,Lr);if(o===null&&(Xr(Wr.set(-.5,.5,0),zr,a,Rr,r,i),qr.set(0,1),o=e.ray.intersectTriangle(Ur,Gr,Wr,!1,Lr),o===null))return;let s=e.ray.origin.distanceTo(Lr);s<e.near||s>e.far||t.push({distance:s,point:Lr.clone(),uv:Kn.getInterpolation(Lr,Ur,Wr,Gr,Kr,qr,Jr,new U),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Xr(e,t,n,r,i,a){Br.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Vr.copy(Br):(Vr.x=a*Br.x-i*Br.y,Vr.y=i*Br.x+a*Br.y),e.copy(t),e.x+=Vr.x,e.y+=Vr.y,e.applyMatrix4(Hr)}var Zr=new W,Qr=new W,$r=new W,ei=new W,ti=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Zr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Zr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Zr.copy(this.origin).addScaledVector(this.direction,t),Zr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Qr.copy(e).add(t).multiplyScalar(.5),$r.copy(t).sub(e).normalize(),ei.copy(this.origin).sub(Qr);let i=e.distanceTo(t)*.5,a=-this.direction.dot($r),o=ei.dot(this.direction),s=-ei.dot($r),c=ei.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Qr).addScaledVector($r,d),f}intersectSphere(e,t){if(e.radius<0)return null;Zr.subVectors(e.center,this.origin);let n=Zr.dot(this.direction),r=Zr.dot(Zr)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Zr)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,ee,j,te;if(y>=b&&y>=x?(w=s,D=u,A=p,te=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,ee=_,j=v):(S=l,C=c,T=f,E=d,O=h,k=m,ee=v,j=_)):b>=x?(w=c,D=d,A=m,te=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,ee=v,j=g):(S=s,C=l,T=u,E=f,O=p,k=h,ee=g,j=v)):(w=l,D=f,A=h,te=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,ee=g,j=_):(S=c,C=s,T=d,E=u,O=m,k=p,ee=_,j=g)),w===0)return null;let M=S/w,ne=C/w,N=1/w,re=T-M*D,P=E-ne*D,ie=O-M*A,ae=k-ne*A,oe=ee-M*te,se=j-ne*te,ce=oe*ae-se*ie,F=re*se-P*oe,le=ie*P-ae*re;if(r){if(ce<0||F<0||le<0)return null}else if((ce<0||F<0||le<0)&&(ce>0||F>0||le>0))return null;let ue=ce+F+le;if(ue===0)return null;let de=N*(ce*D+F*A+le*te);return(ue>0?de<0:de>0)?null:this.at(de/ue,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ni=class extends Pr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new J(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new an,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ri=new q,ii=new ti,ai=new _r,oi=new W,si=new W,ci=new W,li=new W,ui=new W,di=new W,fi=new W,pi=new W,mi=class extends Sn{constructor(e=new Tr,t=new ni){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){di.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(ui.fromBufferAttribute(s,e),a?di.addScaledVector(ui,r):di.addScaledVector(ui.sub(t),r))}t.add(di)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ai.copy(n.boundingSphere),ai.applyMatrix4(i),ii.copy(e.ray).recast(e.near),!(ai.containsPoint(ii.origin)===!1&&(ii.intersectSphere(ai,oi)===null||ii.origin.distanceToSquared(oi)>(e.far-e.near)**2))&&(ri.copy(i).invert(),ii.copy(e.ray).applyMatrix4(ri),(n.boundingBox===null||ii.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,ii)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=gi(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=gi(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=gi(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=gi(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function hi(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;pi.copy(s),pi.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(pi);return l<n.near||l>n.far?null:{distance:l,point:pi.clone(),object:e}}function gi(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,si),e.getVertexPosition(c,ci),e.getVertexPosition(l,li);let u=hi(e,t,n,r,si,ci,li,fi);if(u){let e=new W;Kn.getBarycoord(fi,si,ci,li,e),i&&(u.uv=Kn.getInterpolatedAttribute(i,s,c,l,e,new U)),a&&(u.uv1=Kn.getInterpolatedAttribute(a,s,c,l,e,new U)),o&&(u.normal=Kn.getInterpolatedAttribute(o,s,c,l,e,new W),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new W,materialIndex:0};Kn.getNormal(si,ci,li,t.normal),u.face=t,u.barycoord=e}return u}var _i=class extends Ut{constructor(e=null,t=1,n=1,i,a,o,s,c,l=r,u=r,d,f){super(null,o,s,c,l,u,i,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},vi=class extends Y{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},yi=new q,bi=new q,xi=[],Si=new qn,Ci=new q,wi=new mi,Ti=new _r,Ei=class extends mi{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new vi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ci)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new qn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,yi),Si.copy(e.boundingBox).applyMatrix4(yi),this.boundingBox.union(Si)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new _r),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,yi),Ti.copy(e.boundingSphere).applyMatrix4(yi),this.boundingSphere.union(Ti)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(wi.geometry=this.geometry,wi.material=this.material,wi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ti.copy(this.boundingSphere),Ti.applyMatrix4(n),e.ray.intersectsSphere(Ti)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,yi),bi.multiplyMatrices(n,yi),wi.matrixWorld=bi,wi.raycast(e,xi);for(let e=0,n=xi.length;e<n;e++){let n=xi[e];n.instanceId=i,n.object=this,t.push(n)}xi.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new vi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new _i(new Float32Array(r*this.count),r,this.count,D,h));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Di=new _r,Oi=new U(.5,.5),ki=new W,Ai=class{constructor(e=new Mr,t=new Mr,n=new Mr,r=new Mr,i=new Mr,a=new Mr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ue,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Di.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Di.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Di)}intersectsSprite(e){return Di.center.set(0,0,0),Di.radius=.7071067811865476+Oi.distanceTo(e.center),Di.applyMatrix4(e.matrixWorld),this.intersectsSphere(Di)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ki.x=r.normal.x>0?e.max.x:e.min.x,ki.y=r.normal.y>0?e.max.y:e.min.y,ki.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ki)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},ji=class extends Pr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new J(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Mi=new q,Ni=new ti,Pi=new _r,Fi=new W,Ii=class extends Sn{constructor(e=new Tr,t=new ji){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Pi.copy(n.boundingSphere),Pi.applyMatrix4(r),Pi.radius+=i,e.ray.intersectsSphere(Pi)===!1)return;Mi.copy(r).invert(),Ni.copy(e.ray).applyMatrix4(Mi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Fi.fromBufferAttribute(l,n),Li(Fi,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Fi.fromBufferAttribute(l,a),Li(Fi,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Li(e,t,n,r,i,a,o){let s=Ni.distanceSqToPoint(e);if(s<n){let n=new W;Ni.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ri=class extends Ut{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},zi=class extends Ut{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Bi=class extends Ut{constructor(e,t,n=m,i,a,o,s=r,c=r,l,u=T,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},i,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new zt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Vi=class extends Bi{constructor(e,t=m,n=301,i,a,o=r,s=r,c,l=T){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,i,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Hi=class extends Ut{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},X=class e extends Tr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new pr(c,3)),this.setAttribute(`normal`,new pr(l,3)),this.setAttribute(`uv`,new pr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new W;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ui=class e extends Tr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new pr(u,3)),this.setAttribute(`normal`,new pr(d,3)),this.setAttribute(`uv`,new pr(f,2));function _(){let a=new W,_=new W,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new U,m=new W,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Wi=class e extends Ui{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Gi=class e extends Tr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new pr(i,3)),this.setAttribute(`normal`,new pr(i.slice(),3)),this.setAttribute(`uv`,new pr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new W,r=new W,i=new W;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new W;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new W;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new W,t=new W,n=new W,r=new W,o=new U,s=new U,c=new U;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Ki=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){B(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new U:new W);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new W,r=[],i=[],a=[],o=new W,s=new q;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new W)}i[0]=new W,a[0]=new W;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(H(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(H(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}};function qi(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Ji=new W,Yi=new W,Xi=new qi,Zi=new qi,Qi=new qi,$i=class extends Ki{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new W){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Yi.subVectors(r[0],r[1]).add(r[0]),c=Yi);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Ji.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Ji),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Xi.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Zi.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),Qi.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Xi.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Zi.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),Qi.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Xi.calc(s),Zi.calc(s),Qi.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new W().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}},ea=class e extends Gi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},ta=class e extends Tr{constructor(e=[new U(0,-.5),new U(.5,0),new U(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type=`LatheGeometry`,this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=H(r,0,Math.PI*2);let i=[],a=[],o=[],s=[],c=[],l=1/t,u=new W,d=new U,f=new W,p=new W,m=new W,h=0,g=0;for(let t=0;t<=e.length-1;t++)switch(t){case 0:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,m.copy(f),f.normalize(),s.push(f.x,f.y,f.z);break;case e.length-1:s.push(m.x,m.y,m.z);break;default:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,p.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),s.push(f.x,f.y,f.z),m.copy(p)}for(let i=0;i<=t;i++){let f=n+i*l*r,p=Math.sin(f),m=Math.cos(f);for(let n=0;n<=e.length-1;n++){u.x=e[n].x*p,u.y=e[n].y,u.z=e[n].x*m,a.push(u.x,u.y,u.z),d.x=i/t,d.y=n/(e.length-1),o.push(d.x,d.y);let r=s[3*n+0]*p,l=s[3*n+1],f=s[3*n+0]*m;c.push(r,l,f)}}for(let n=0;n<t;n++)for(let t=0;t<e.length-1;t++){let r=t+n*e.length,a=r,o=r+e.length,s=r+e.length+1,c=r+1;i.push(a,o,c),i.push(s,c,o)}this.setIndex(i),this.setAttribute(`position`,new pr(a,3)),this.setAttribute(`uv`,new pr(o,2)),this.setAttribute(`normal`,new pr(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.points,t.segments,t.phiStart,t.phiLength)}},na=class e extends Tr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new pr(p,3)),this.setAttribute(`normal`,new pr(m,3)),this.setAttribute(`uv`,new pr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},ra=class e extends Tr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new W,d=new W,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new pr(p,3)),this.setAttribute(`normal`,new pr(m,3)),this.setAttribute(`uv`,new pr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},ia=class e extends Tr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new W,f=new W,p=new W;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new pr(c,3)),this.setAttribute(`normal`,new pr(l,3)),this.setAttribute(`uv`,new pr(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function aa(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(sa(i))i.isRenderTargetTexture?(B(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(sa(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function oa(e){let t={};for(let n=0;n<e.length;n++){let r=aa(e[n]);for(let e in r)t[e]=r[e]}return t}function sa(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function ca(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function la(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:K.workingColorSpace}var ua={clone:aa,merge:oa},da=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,fa=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pa=class extends Pr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=da,this.fragmentShader=fa,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=aa(e.uniforms),this.uniformsGroups=ca(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new J().setHex(r.value);break;case`v2`:this.uniforms[n].value=new U().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new W().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Wt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new G().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new q().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ma=class extends pa{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},ha=class extends Pr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=R,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ga=class extends Pr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function _a(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function va(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var ya=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},ba=class extends ya{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Fe,endingEnd:Fe}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case L:i=e,o=2*t-n;break;case Ie:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case L:a=e,s=2*n-t;break;case Ie:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},xa=class extends ya{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Sa=class extends ya{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ca=class extends ya{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Ea(n,t,g,y,r);i[p]=wa(x,o,_,b,m)}return i}};function wa(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Ta(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Ea(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=wa(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Ta(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Da=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=_a(t,this.TimeBufferType),this.values=_a(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:_a(e.times,Array),values:_a(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),va(e.settings)&&(n.settings={inTangents:_a(e.settings.inTangents,Array),outTangents:_a(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Sa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new xa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ba(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ca(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Me:t=this.InterpolantFactoryMethodDiscrete;break;case I:t=this.InterpolantFactoryMethodLinear;break;case Ne:t=this.InterpolantFactoryMethodSmooth;break;case Pe:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return B(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Me;case this.InterpolantFactoryMethodLinear:return I;case this.InterpolantFactoryMethodSmooth:return Ne;case this.InterpolantFactoryMethodBezier:return Pe}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;va(this.settings)&&(Oa(this.settings.inTangents,e),Oa(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(V(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(V(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){V(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){V(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Ge(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){V(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ne,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,va(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Oa(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Da.prototype.ValueTypeName=``,Da.prototype.TimeBufferType=Float32Array,Da.prototype.ValueBufferType=Float32Array,Da.prototype.DefaultInterpolation=I;var ka=class extends Da{constructor(e,t,n){super(e,t,n)}};ka.prototype.ValueTypeName=`bool`,ka.prototype.ValueBufferType=Array,ka.prototype.DefaultInterpolation=Me,ka.prototype.InterpolantFactoryMethodLinear=void 0,ka.prototype.InterpolantFactoryMethodSmooth=void 0;var Aa=class extends Da{constructor(e,t,n,r){super(e,t,n,r)}};Aa.prototype.ValueTypeName=`color`;var ja=class extends Da{constructor(e,t,n,r){super(e,t,n,r)}};ja.prototype.ValueTypeName=`number`;var Ma=class extends ya{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Dt.slerpFlat(i,0,a,c-o,a,c,s);return i}},Na=class extends Da{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Ma(this.times,this.values,this.getValueSize(),e)}};Na.prototype.ValueTypeName=`quaternion`,Na.prototype.InterpolantFactoryMethodSmooth=void 0;var Pa=class extends Da{constructor(e,t,n){super(e,t,n)}};Pa.prototype.ValueTypeName=`string`,Pa.prototype.ValueBufferType=Array,Pa.prototype.DefaultInterpolation=Me,Pa.prototype.InterpolantFactoryMethodLinear=void 0,Pa.prototype.InterpolantFactoryMethodSmooth=void 0;var Fa=class extends Da{constructor(e,t,n,r){super(e,t,n,r)}};Fa.prototype.ValueTypeName=`vector`;var Ia={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(La(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!La(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function La(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}var Ra=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return e=e.normalize(`NFC`),s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},za=class{constructor(e){this.manager=e===void 0?Ra:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};za.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var Ba=new WeakMap,Va=class extends za{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=Ia.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=Ba.get(a);e===void 0&&(e=[],Ba.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=Ke(`img`);function s(){l(),t&&t(this);let n=Ba.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}Ba.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),Ia.remove(`image:${e}`);let n=Ba.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}Ba.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Ia.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},Ha=class extends za{constructor(e){super(e)}load(e,t,n,r){let i=new Ut,a=new Va(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},Ua=new W,Wa=new Dt,Ga=new W,Ka=class extends Sn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new q,this.projectionMatrix=new q,this.projectionMatrixInverse=new q,this.coordinateSystem=Ue,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ua,Wa,Ga),Ga.x===1&&Ga.y===1&&Ga.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ua,Wa,Ga.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ua,Wa,Ga),Ga.x===1&&Ga.y===1&&Ga.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ua,Wa,Ga.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},qa=new W,Ja=new U,Ya=new U,Xa=class extends Ka{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=it*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(rt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return it*2*Math.atan(Math.tan(rt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){qa.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qa.x,qa.y).multiplyScalar(-e/qa.z),qa.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qa.x,qa.y).multiplyScalar(-e/qa.z)}getViewSize(e,t){return this.getViewBounds(e,Ja,Ya),t.subVectors(Ya,Ja)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(rt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Za=class extends Ka{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Qa=-90,$a=1,eo=class extends Sn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Xa(Qa,$a,e,t);r.layers=this.layers,this.add(r);let i=new Xa(Qa,$a,e,t);i.layers=this.layers,this.add(i);let a=new Xa(Qa,$a,e,t);a.layers=this.layers,this.add(a);let o=new Xa(Qa,$a,e,t);o.layers=this.layers,this.add(o);let s=new Xa(Qa,$a,e,t);s.layers=this.layers,this.add(s);let c=new Xa(Qa,$a,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},to=class extends Xa{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},no=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=ro.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function ro(){this._document.hidden===!1&&this.reset()}var io=`\\[\\]\\.:\\/`,ao=RegExp(`[\\[\\]\\.:\\/]`,`g`),oo=`[^\\[\\]\\.:\\/]`,so=`[^`+io.replace(`\\.`,``)+`]`,co=`((?:WC+[\\/:])*)`.replace(`WC`,oo),lo=`(WCOD+)?`.replace(`WCOD`,so),uo=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,oo),fo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,oo),po=RegExp(`^`+co+lo+uo+fo+`$`),mo=[`material`,`materials`,`bones`,`map`],ho=class{constructor(e,t,n){let r=n||go.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},go=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(ao,``)}static parseTrackName(e){let t=po.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);mo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){B(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){V(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){V(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){V(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){V(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){V(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;V(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};go.Composite=ho,go.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},go.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},go.prototype.GetterByBindingType=[go.prototype._getValue_direct,go.prototype._getValue_array,go.prototype._getValue_arrayElement,go.prototype._getValue_toArray],go.prototype.SetterByBindingTypeAndVersioning=[[go.prototype._setValue_direct,go.prototype._setValue_direct_setNeedsUpdate,go.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[go.prototype._setValue_array,go.prototype._setValue_array_setNeedsUpdate,go.prototype._setValue_array_setMatrixWorldNeedsUpdate],[go.prototype._setValue_arrayElement,go.prototype._setValue_arrayElement_setNeedsUpdate,go.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[go.prototype._setValue_fromArray,go.prototype._setValue_fromArray_setNeedsUpdate,go.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function _o(e,t,n,r){let i=vo(r);switch(n){case S:return e*t;case D:return e*t/i.components*i.byteLength;case O:return e*t/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case A:return e*t*2/i.components*i.byteLength;case C:return e*t*3/i.components*i.byteLength;case w:return e*t*4/i.components*i.byteLength;case ee:return e*t*4/i.components*i.byteLength;case j:case te:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case M:case ne:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case re:case ie:return Math.max(e,16)*Math.max(t,8)/4;case N:case P:return Math.max(e,8)*Math.max(t,8)/2;case ae:case oe:case ce:case F:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case se:case le:case ue:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case de:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case fe:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case pe:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case me:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case he:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ge:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case _e:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case ve:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case ye:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case be:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case xe:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Ce:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case we:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Te:case Ee:case De:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Oe:case ke:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ae:case je:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function vo(e){switch(e){case l:case u:return{byteLength:1,components:1};case f:case d:case g:return{byteLength:2,components:1};case _:case v:return{byteLength:2,components:4};case m:case p:case h:return{byteLength:4,components:1};case b:case x:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?B(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function yo(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function bo(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Z={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
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
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
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
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
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
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
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
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
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
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
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
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
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
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
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
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
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
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
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
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
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
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
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
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
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
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
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
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
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
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
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
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
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
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
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
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
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
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
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
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
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
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
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
		return 0.5 / max( gv + gl, EPSILON );
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
	vec3 f0 = material.specularColorBlended;
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
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
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
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
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
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
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
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
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
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
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
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
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
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
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
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
	#ifdef DOUBLE_SIDED
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
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
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
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
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
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
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
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
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
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
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
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
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
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
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
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
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
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
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
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
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
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
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
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
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
}`,depth_frag:`#if DEPTH_PACKING == 3200
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
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
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
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
}`,linedashed_frag:`uniform vec3 diffuse;
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
}`,meshbasic_vert:`#include <common>
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
}`,meshbasic_frag:`uniform vec3 diffuse;
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
}`,meshlambert_vert:`#define LAMBERT
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
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
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
}`,meshmatcap_vert:`#define MATCAP
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
}`,meshmatcap_frag:`#define MATCAP
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
}`,meshnormal_vert:`#define NORMAL
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
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
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
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
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
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
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
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
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
}`,meshphysical_vert:`#define STANDARD
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
}`,meshphysical_frag:`#define STANDARD
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
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
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
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
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
}`,meshtoon_vert:`#define TOON
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
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
}`,points_vert:`uniform float size;
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
}`,points_frag:`uniform vec3 diffuse;
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
}`,shadow_vert:`#include <common>
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
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
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
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
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
}`,sprite_frag:`uniform vec3 diffuse;
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
}`},Q={common:{diffuse:{value:new J(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new G}},envmap:{envMap:{value:null},envMapRotation:{value:new G},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new G}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new G}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new G},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new G},normalScale:{value:new U(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new G},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new G}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new G}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new G}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new J(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new W},probesMax:{value:new W},probesResolution:{value:new W}},points:{diffuse:{value:new J(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0},uvTransform:{value:new G}},sprite:{diffuse:{value:new J(16777215)},opacity:{value:1},center:{value:new U(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}}},xo={basic:{uniforms:oa([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.fog]),vertexShader:Z.meshbasic_vert,fragmentShader:Z.meshbasic_frag},lambert:{uniforms:oa([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new J(0)},envMapIntensity:{value:1}}]),vertexShader:Z.meshlambert_vert,fragmentShader:Z.meshlambert_frag},phong:{uniforms:oa([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new J(0)},specular:{value:new J(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Z.meshphong_vert,fragmentShader:Z.meshphong_frag},standard:{uniforms:oa([Q.common,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.roughnessmap,Q.metalnessmap,Q.fog,Q.lights,{emissive:{value:new J(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag},toon:{uniforms:oa([Q.common,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.gradientmap,Q.fog,Q.lights,{emissive:{value:new J(0)}}]),vertexShader:Z.meshtoon_vert,fragmentShader:Z.meshtoon_frag},matcap:{uniforms:oa([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,{matcap:{value:null}}]),vertexShader:Z.meshmatcap_vert,fragmentShader:Z.meshmatcap_frag},points:{uniforms:oa([Q.points,Q.fog]),vertexShader:Z.points_vert,fragmentShader:Z.points_frag},dashed:{uniforms:oa([Q.common,Q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Z.linedashed_vert,fragmentShader:Z.linedashed_frag},depth:{uniforms:oa([Q.common,Q.displacementmap]),vertexShader:Z.depth_vert,fragmentShader:Z.depth_frag},normal:{uniforms:oa([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,{opacity:{value:1}}]),vertexShader:Z.meshnormal_vert,fragmentShader:Z.meshnormal_frag},sprite:{uniforms:oa([Q.sprite,Q.fog]),vertexShader:Z.sprite_vert,fragmentShader:Z.sprite_frag},background:{uniforms:{uvTransform:{value:new G},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Z.background_vert,fragmentShader:Z.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new G}},vertexShader:Z.backgroundCube_vert,fragmentShader:Z.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Z.cube_vert,fragmentShader:Z.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Z.equirect_vert,fragmentShader:Z.equirect_frag},distance:{uniforms:oa([Q.common,Q.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Z.distance_vert,fragmentShader:Z.distance_frag},shadow:{uniforms:oa([Q.lights,Q.fog,{color:{value:new J(0)},opacity:{value:1}}]),vertexShader:Z.shadow_vert,fragmentShader:Z.shadow_frag}};xo.physical={uniforms:oa([xo.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new G},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new G},clearcoatNormalScale:{value:new U(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new G},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new G},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new G},sheen:{value:0},sheenColor:{value:new J(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new G},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new G},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new G},transmissionSamplerSize:{value:new U},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new G},attenuationDistance:{value:0},attenuationColor:{value:new J(0)},specularColor:{value:new J(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new G},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new G},anisotropyVector:{value:new U},anisotropyMap:{value:null},anisotropyMapTransform:{value:new G}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag};var So={r:0,b:0,g:0},Co=new q,wo=new G;wo.set(-1,0,0,0,1,0,0,0,1);function To(e,t,n,r,i,a){let o=new J(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new mi(new X(1,1,1),new pa({name:`BackgroundCubeMaterial`,uniforms:aa(xo.backgroundCube.uniforms),vertexShader:xo.backgroundCube.vertexShader,fragmentShader:xo.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Co.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(wo),l.material.toneMapped=K.getTransfer(i.colorSpace)!==ze,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new mi(new na(2,2),new pa({name:`BackgroundMaterial`,uniforms:aa(xo.background.uniforms),vertexShader:xo.background.vertexShader,fragmentShader:xo.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=K.getTransfer(i.colorSpace)!==ze,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(So,la(e)),n.buffers.color.setClear(So.r,So.g,So.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Eo(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Do(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Oo(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(B(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&B(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function ko(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Mr,s=new G,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Ao=4,jo=6,Mo=20,No=256,Po=new Za,Fo=new J,Io=null,Lo=0,Ro=0,zo=!1,Bo=new W,Vo=new W,Ho=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Bo}=i;Io=this._renderer.getRenderTarget(),Lo=this._renderer.getActiveCubeFace(),Ro=this._renderer.getActiveMipmapLevel(),zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Yo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Jo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Io,Lo,Ro),this._renderer.xr.enabled=zo,e.scissorTest=!1,Go(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Io=this._renderer.getRenderTarget(),Lo=this._renderer.getActiveCubeFace(),Ro=this._renderer.getActiveMipmapLevel(),zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:o,minFilter:o,generateMipmaps:!1,type:g,format:w,colorSpace:z,depthBuffer:!1},r=Wo(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wo(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Uo(r)),this._blurMaterial=qo(r,e,t),this._ggxMaterial=Ko(r,e,t)}return r}_compileMaterial(e){let t=new mi(new Tr,e);this._renderer.compile(t,Po)}_sceneToCubeUV(e,t,n,r,i){let a=new Xa(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Fo),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new mi(new X,new ni({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Fo),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Go(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Yo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Jo());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Go(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Po)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-Ao?n-d+Ao:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,Go(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Po),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,Go(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Po)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];Go(t,3*l*(r>this._lodMax-Ao?r-this._lodMax+Ao:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Po)}};function Uo(e){let t=[],n=[],r=e,i=e-Ao+1+jo;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?Vo.set(1,r,n):e===1?Vo.set(-n,1,-r):e===2?Vo.set(-n,r,1):e===3?Vo.set(-1,r,-n):e===4?Vo.set(-n,-1,r):Vo.set(n,r,-1),Vo.toArray(l,(e*6+t)*3)}}let u=new Tr;u.setAttribute(`position`,new Y(c,3)),u.setAttribute(`outputDirection`,new Y(l,3)),n.push(new mi(u,null)),r>Ao&&r--}return{lodMeshes:n,sizeLods:t}}function Wo(e,t,n){let r=new Kt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Go(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Ko(e,t,n){return new pa({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:No,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Xo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function qo(e,t,n){return new pa({name:`SphericalGaussianBlur`,defines:{SAMPLES:Mo,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Xo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Jo(){return new pa({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Xo(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Yo(){return new pa({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Xo(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Zo=class extends Kt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ri(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new X(5,5,5),i=new pa({name:`CubemapFromEquirect`,uniforms:aa(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new mi(r,i),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=o),new eo(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Qo(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Zo(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Ho(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Ho(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function $o(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Ze(`WebGLRenderer: `+e+` extension not supported.`),t}}}function es(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?fr:dr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function ts(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ns(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:V(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function rs(e,t,n){let r=new WeakMap,i=new Wt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new qt(g,p,m,u);_.type=h,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new U(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function is(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var as={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function os(e,t,n,r,i,a){let o=new Kt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Tr;l.setAttribute(`position`,new pr([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new pr([0,2,0,0,2,0],2));let u=new ma({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new mi(l,u),f=new Za(-1,1,1,-1,0,1),p=null,m=null,h=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new Kt(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}),c=new Kt(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<y.length;e++){let r=y[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,h=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},K.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=as[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(d,f),v=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var ss=new Ut,cs=new Bi(1,1),ls=new qt,us=new Jt,ds=new Ri,fs=[],ps=[],ms=new Float32Array(16),hs=new Float32Array(9),gs=new Float32Array(4);function _s(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=fs[i];if(a===void 0&&(a=new Float32Array(i),fs[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function vs(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function ys(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function bs(e,t){let n=ps[t];n===void 0&&(n=new Int32Array(t),ps[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function xs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ss(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(vs(n,t))return;e.uniform2fv(this.addr,t),ys(n,t)}}function Cs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(vs(n,t))return;e.uniform3fv(this.addr,t),ys(n,t)}}function ws(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(vs(n,t))return;e.uniform4fv(this.addr,t),ys(n,t)}}function Ts(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(vs(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),ys(n,t)}else{if(vs(n,r))return;gs.set(r),e.uniformMatrix2fv(this.addr,!1,gs),ys(n,r)}}function Es(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(vs(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),ys(n,t)}else{if(vs(n,r))return;hs.set(r),e.uniformMatrix3fv(this.addr,!1,hs),ys(n,r)}}function Ds(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(vs(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),ys(n,t)}else{if(vs(n,r))return;ms.set(r),e.uniformMatrix4fv(this.addr,!1,ms),ys(n,r)}}function Os(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function ks(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(vs(n,t))return;e.uniform2iv(this.addr,t),ys(n,t)}}function As(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(vs(n,t))return;e.uniform3iv(this.addr,t),ys(n,t)}}function js(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(vs(n,t))return;e.uniform4iv(this.addr,t),ys(n,t)}}function Ms(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Ns(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(vs(n,t))return;e.uniform2uiv(this.addr,t),ys(n,t)}}function Ps(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(vs(n,t))return;e.uniform3uiv(this.addr,t),ys(n,t)}}function Fs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(vs(n,t))return;e.uniform4uiv(this.addr,t),ys(n,t)}}function Is(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(cs.compareFunction=n.isReversedDepthBuffer()?518:515,a=cs):a=ss,n.setTexture2D(t||a,i)}function Ls(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||us,i)}function Rs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||ds,i)}function zs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ls,i)}function Bs(e){switch(e){case 5126:return xs;case 35664:return Ss;case 35665:return Cs;case 35666:return ws;case 35674:return Ts;case 35675:return Es;case 35676:return Ds;case 5124:case 35670:return Os;case 35667:case 35671:return ks;case 35668:case 35672:return As;case 35669:case 35673:return js;case 5125:return Ms;case 36294:return Ns;case 36295:return Ps;case 36296:return Fs;case 35678:case 36198:case 36298:case 36306:case 35682:return Is;case 35679:case 36299:case 36307:return Ls;case 35680:case 36300:case 36308:case 36293:return Rs;case 36289:case 36303:case 36311:case 36292:return zs}}function Vs(e,t){e.uniform1fv(this.addr,t)}function Hs(e,t){let n=_s(t,this.size,2);e.uniform2fv(this.addr,n)}function Us(e,t){let n=_s(t,this.size,3);e.uniform3fv(this.addr,n)}function Ws(e,t){let n=_s(t,this.size,4);e.uniform4fv(this.addr,n)}function Gs(e,t){let n=_s(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Ks(e,t){let n=_s(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function qs(e,t){let n=_s(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Js(e,t){e.uniform1iv(this.addr,t)}function Ys(e,t){e.uniform2iv(this.addr,t)}function Xs(e,t){e.uniform3iv(this.addr,t)}function Zs(e,t){e.uniform4iv(this.addr,t)}function Qs(e,t){e.uniform1uiv(this.addr,t)}function $s(e,t){e.uniform2uiv(this.addr,t)}function ec(e,t){e.uniform3uiv(this.addr,t)}function tc(e,t){e.uniform4uiv(this.addr,t)}function nc(e,t,n){let r=this.cache,i=t.length,a=bs(n,i);vs(r,a)||(e.uniform1iv(this.addr,a),ys(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?cs:ss;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function rc(e,t,n){let r=this.cache,i=t.length,a=bs(n,i);vs(r,a)||(e.uniform1iv(this.addr,a),ys(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||us,a[e])}function ic(e,t,n){let r=this.cache,i=t.length,a=bs(n,i);vs(r,a)||(e.uniform1iv(this.addr,a),ys(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||ds,a[e])}function ac(e,t,n){let r=this.cache,i=t.length,a=bs(n,i);vs(r,a)||(e.uniform1iv(this.addr,a),ys(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ls,a[e])}function oc(e){switch(e){case 5126:return Vs;case 35664:return Hs;case 35665:return Us;case 35666:return Ws;case 35674:return Gs;case 35675:return Ks;case 35676:return qs;case 5124:case 35670:return Js;case 35667:case 35671:return Ys;case 35668:case 35672:return Xs;case 35669:case 35673:return Zs;case 5125:return Qs;case 36294:return $s;case 36295:return ec;case 36296:return tc;case 35678:case 36198:case 36298:case 36306:case 35682:return nc;case 35679:case 36299:case 36307:return rc;case 35680:case 36300:case 36308:case 36293:return ic;case 36289:case 36303:case 36311:case 36292:return ac}}var sc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Bs(t.type)}},cc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=oc(t.type)}},lc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},uc=/(\w+)(\])?(\[|\.)?/g;function dc(e,t){e.seq.push(t),e.map[t.id]=t}function fc(e,t,n){let r=e.name,i=r.length;for(uc.lastIndex=0;;){let a=uc.exec(r),o=uc.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){dc(n,l===void 0?new sc(s,e,t):new cc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new lc(s),dc(n,e)),n=e}}}var pc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);fc(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function mc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var hc=37297,gc=0;function _c(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var vc=new G;function yc(e){K._getMatrix(vc,K.workingColorSpace,e);let t=`mat3( ${vc.elements.map(e=>e.toFixed(4))} )`;switch(K.getTransfer(e)){case Re:return[t,`LinearTransferOETF`];case ze:return[t,`sRGBTransferOETF`];default:return B(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function bc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+_c(e.getShaderSource(t),r)}return i}function xc(e,t){let n=yc(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Sc={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Cc(e,t){let n=Sc[t];return n===void 0?(B(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var wc=new W;function Tc(){return K.getLuminanceCoefficients(wc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${wc.x.toFixed(4)}, ${wc.y.toFixed(4)}, ${wc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Ec(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(kc).join(`
`)}function Dc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Oc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function kc(e){return e!==``}function Ac(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function jc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Mc=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nc(e){return e.replace(Mc,Fc)}var Pc=new Map;function Fc(e,t){let n=Z[t];if(n===void 0){let e=Pc.get(t);if(e!==void 0)n=Z[e],B(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return Nc(n)}var Ic=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Lc(e){return e.replace(Ic,Rc)}function Rc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function zc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Bc={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Vc(e){return Bc[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Hc={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function Uc(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:Hc[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var Wc={302:`ENVMAP_MODE_REFRACTION`};function Gc(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Wc[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Kc={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function qc(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Kc[e.combine]||`ENVMAP_BLENDING_NONE`}function Jc(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Yc(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Vc(n),l=Uc(n),u=Gc(n),d=qc(n),f=Jc(n),p=Ec(n),m=Dc(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(kc).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(kc).join(`
`),_.length>0&&(_+=`
`)):(g=[zc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(kc).join(`
`),_=[zc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Z.tonemapping_pars_fragment,n.toneMapping===0?``:Cc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Z.colorspace_pars_fragment,xc(`linearToOutputTexel`,n.outputColorSpace),Tc(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(kc).join(`
`)),o=Nc(o),o=Ac(o,n),o=jc(o,n),s=Nc(s),s=Ac(s,n),s=jc(s,n),o=Lc(o),s=Lc(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=mc(i,i.VERTEX_SHADER,y),S=mc(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=bc(i,x,`vertex`),n=bc(i,S,`fragment`);V(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):B(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new pc(i,h),T=Oc(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,hc)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=gc++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Xc=0,Zc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Qc(e),t.set(e,n)),n}},Qc=class{constructor(e){this.id=Xc++,this.code=e,this.usedTimes=0}};function $c(e){return e===1030||e===37490||e===36285}function el(e,t,n,r,i,a){let o=new on,s=new Zc,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&B(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=xo[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),k=e.id,A=t.id}let ee=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),te=h.isInstancedMesh===!0,M=h.isBatchedMesh===!0,ne=!!i.map,N=!!i.matcap,re=!!x,P=!!i.aoMap,ie=!!i.lightMap,ae=!!i.bumpMap&&i.wireframe===!1,oe=!!i.normalMap,se=!!i.displacementMap,ce=!!i.emissiveMap,F=!!i.metalnessMap,le=!!i.roughnessMap,ue=i.anisotropy>0,de=i.clearcoat>0,fe=i.dispersion>0,pe=i.retroreflectivity>0,me=i.iridescence>0,he=i.sheen>0,ge=i.transmission>0,_e=ue&&!!i.anisotropyMap,ve=de&&!!i.clearcoatMap,ye=de&&!!i.clearcoatNormalMap,be=de&&!!i.clearcoatRoughnessMap,xe=me&&!!i.iridescenceMap,Se=me&&!!i.iridescenceThicknessMap,Ce=he&&!!i.sheenColorMap,we=he&&!!i.sheenRoughnessMap,Te=!!i.specularMap,Ee=!!i.specularColorMap,De=!!i.specularIntensityMap,Oe=ge&&!!i.transmissionMap,ke=ge&&!!i.thicknessMap,Ae=!!i.gradientMap,je=!!i.alphaMap,Me=i.alphaTest>0,I=!!i.alphaHash,Ne=!!i.extensions,Pe=0;i.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Pe=e.toneMapping);let Fe={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:M,batchingColor:M&&h._colorsTexture!==null,instancing:te,instancingColor:te&&h.instanceColor!==null,instancingMorph:te&&h.morphTexture!==null,outputColorSpace:ee===null?e.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:K.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:ne,matcap:N,envMap:re,envMapMode:re&&x.mapping,envMapCubeUVHeight:S,aoMap:P,lightMap:ie,bumpMap:ae,normalMap:oe,displacementMap:se,emissiveMap:ce,normalMapObjectSpace:oe&&i.normalMapType===1,normalMapTangentSpace:oe&&i.normalMapType===0,packedNormalMap:oe&&i.normalMapType===0&&$c(i.normalMap.format),metalnessMap:F,roughnessMap:le,anisotropy:ue,anisotropyMap:_e,clearcoat:de,clearcoatMap:ve,clearcoatNormalMap:ye,clearcoatRoughnessMap:be,dispersion:fe,retroreflection:pe,iridescence:me,iridescenceMap:xe,iridescenceThicknessMap:Se,sheen:he,sheenColorMap:Ce,sheenRoughnessMap:we,specularMap:Te,specularColorMap:Ee,specularIntensityMap:De,transmission:ge,transmissionMap:Oe,thicknessMap:ke,gradientMap:Ae,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:je,alphaTest:Me,alphaHash:I,combine:i.combine,mapUv:ne&&m(i.map.channel),aoMapUv:P&&m(i.aoMap.channel),lightMapUv:ie&&m(i.lightMap.channel),bumpMapUv:ae&&m(i.bumpMap.channel),normalMapUv:oe&&m(i.normalMap.channel),displacementMapUv:se&&m(i.displacementMap.channel),emissiveMapUv:ce&&m(i.emissiveMap.channel),metalnessMapUv:F&&m(i.metalnessMap.channel),roughnessMapUv:le&&m(i.roughnessMap.channel),anisotropyMapUv:_e&&m(i.anisotropyMap.channel),clearcoatMapUv:ve&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:ye&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:be&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:we&&m(i.sheenRoughnessMap.channel),specularMapUv:Te&&m(i.specularMap.channel),specularColorMapUv:Ee&&m(i.specularColorMap.channel),specularIntensityMapUv:De&&m(i.specularIntensityMap.channel),transmissionMapUv:Oe&&m(i.transmissionMap.channel),thicknessMapUv:ke&&m(i.thicknessMap.channel),alphaMapUv:je&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(oe||ue),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(ne||je),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&oe===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Pe,decodeVideoTexture:ne&&i.map.isVideoTexture===!0&&K.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&i.emissiveMap.isVideoTexture===!0&&K.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Ne&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ne&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Fe.vertexUv1s=c.has(1),Fe.vertexUv2s=c.has(2),Fe.vertexUv3s=c.has(3),c.clear(),Fe}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=xo[t];n=ua.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Yc(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function tl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function nl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function rl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function il(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||nl),r.length>1&&r.sort(t||rl),i.length>1&&i.sort(t||rl)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function al(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new il,e.set(t,[i])):n>=r.length?(i=new il,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function ol(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new W,color:new J};break;case`SpotLight`:n={position:new W,direction:new W,color:new J,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new W,color:new J,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new W,skyColor:new J,groundColor:new J};break;case`RectAreaLight`:n={color:new J,position:new W,halfWidth:new W,halfHeight:new W}}return e[t.id]=n,n}}}function sl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var cl=0;function ll(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function ul(e){let t=new ol,n=sl(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new W);let i=new W,a=new q,o=new q;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(ll);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Q.LTC_FLOAT_1,r.rectAreaLTC2=Q.LTC_FLOAT_2):(r.rectAreaLTC1=Q.LTC_HALF_1,r.rectAreaLTC2=Q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=cl++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function dl(e){let t=new ul(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function fl(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new dl(e),t.set(n,[a])):r>=i.length?(a=new dl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var pl=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ml=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,hl=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],gl=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],_l=new q,vl=new W,yl=new W;function bl(e,t,n){let i=new Ai,a=new U,s=new U,c=new Wt,l=new ha,u=new ga,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},_=new pa({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new U},radius:{value:4}},vertexShader:pl,fragmentShader:ml}),v=_.clone();v.defines.HORIZONTAL_PASS=1;let y=new Tr;y.setAttribute(`position`,new Y(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new mi(y,_),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(B(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.state;_.setBlending(0),_.buffers.depth.getReversed()===!0?_.buffers.color.setClear(0,0,0,0):_.buffers.color.setClear(1,1,1,1),_.buffers.depth.setTest(!0),_.setScissorTest(!1);let v=S!==this.type;v&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){B(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let y=p.getFrameExtents();a.multiply(y),s.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(s.x=Math.floor(f/y.x),a.x=s.x*y.x,p.mapSize.x=s.x),a.y>f&&(s.y=Math.floor(f/y.y),a.y=s.y*y.y,p.mapSize.y=s.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||v===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){B(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Kt(a.x,a.y,{format:k,type:g,minFilter:o,magFilter:o,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new Bi(a.x,a.y,h),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=T,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r}else d.isPointLight?(p.map=new Zo(a.x),p.map.depthTexture=new Vi(a.x,m)):(p.map=new Kt(a.x,a.y),p.map.depthTexture=new Bi(a.x,a.y,m)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=T,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==a.x||p.map.height!==a.y)&&p.map.setSize(a.x,a.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);for(let t=0;t<x;t++){let r=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),vl.setFromMatrixPosition(d.matrixWorld),e.position.copy(vl),yl.copy(e.position),yl.add(hl[t]),e.up.copy(gl[t]),e.lookAt(yl),e.updateMatrixWorld(),n.makeTranslation(-vl.x,-vl.y,-vl.z),_l.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(_l,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);c.set(s.x*n.x,s.y*n.y,s.x*n.z,s.y*n.w),_.viewport(c)}i=p.getFrustum(t),E(n,l,r,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let i=t.update(b);_.defines.VSM_SAMPLES!==n.blurSamples&&(_.defines.VSM_SAMPLES=n.blurSamples,v.defines.VSM_SAMPLES=n.blurSamples,_.needsUpdate=!0,v.needsUpdate=!0),n.mapPass===null?n.mapPass=new Kt(a.x,a.y,{format:k,type:g}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),_.uniforms.shadow_pass.value=n.map.depthTexture,_.uniforms.resolution.value.set(n.map.width,n.map.height),_.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,_,b,null),v.uniforms.shadow_pass.value=n.mapPass.texture,v.uniforms.resolution.value.set(n.map.width,n.map.height),v.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,v,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,D)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function E(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(i))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)E(c[e],r,a,o,s)}function D(e){e.target.removeEventListener(`dispose`,D);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function xl(e,t){function n(){let t=!1,n=new Wt,r=null,i=new Wt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?F(e.DEPTH_TEST):le(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=$e[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?F(e.STENCIL_TEST):le(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,M=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(M=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),te=M>=2):(M=parseFloat(/^WebGL (\d)/.exec(ne)[1]),te=M>=1);let N=null,re={},P=e.getParameter(e.SCISSOR_BOX),ie=e.getParameter(e.VIEWPORT),ae=new Wt().fromArray(P),oe=new Wt().fromArray(ie);function se(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ce={};ce[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),ce[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ce[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),F(e.DEPTH_TEST),o.setFunc(3),_e(!1),ve(1),F(e.CULL_FACE),he(0);function F(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function le(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ue(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function de(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function fe(t){return h!==t&&(e.useProgram(t),h=t,!0)}let pe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};pe[103]=e.MIN,pe[104]=e.MAX;let me={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function he(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(le(e.BLEND),g=!1);return}if(g===!1&&(F(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:V(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:V(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:V(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:V(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(pe[n],pe[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(me[r],me[i],me[o],me[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ge(t,n){t.side===2?le(e.CULL_FACE):F(e.CULL_FACE);let r=t.side===1;n&&(r=!r),_e(r),t.blending===1&&t.transparent===!1?he(0):he(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),be(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?F(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function _e(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ve(t){t===0?le(e.CULL_FACE):(F(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function ye(t){t!==k&&(te&&e.lineWidth(t),k=t)}function be(t,n,r){t?(F(e.POLYGON_OFFSET_FILL),(A!==n||ee!==r)&&(A=n,ee=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):le(e.POLYGON_OFFSET_FILL)}function xe(t){t?F(e.SCISSOR_TEST):le(e.SCISSOR_TEST)}function Se(t){t===void 0&&(t=e.TEXTURE0+j-1),N!==t&&(e.activeTexture(t),N=t)}function Ce(t,n,r){r===void 0&&(r=N===null?e.TEXTURE0+j-1:N);let i=re[r];i===void 0&&(i={type:void 0,texture:void 0},re[r]=i),(i.type!==t||i.texture!==n)&&(N!==r&&(e.activeTexture(r),N=r),e.bindTexture(t,n||ce[t]),i.type=t,i.texture=n)}function we(){let t=re[N];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Te(){try{e.compressedTexImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ee(){try{e.compressedTexImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function De(){try{e.texSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Oe(){try{e.texSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function ke(){try{e.compressedTexSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ae(){try{e.compressedTexSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function je(){try{e.texStorage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Me(){try{e.texStorage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function I(){try{e.texImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ne(){try{e.texImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Pe(t){return d[t]===void 0?e.getParameter(t):d[t]}function Fe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function L(t){ae.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ae.copy(t))}function Ie(t){oe.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),oe.copy(t))}function R(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Le(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function z(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},N=null,re={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new J(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,ae.set(0,0,e.canvas.width,e.canvas.height),oe.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:F,disable:le,bindFramebuffer:ue,drawBuffers:de,useProgram:fe,setBlending:he,setMaterial:ge,setFlipSided:_e,setCullFace:ve,setLineWidth:ye,setPolygonOffset:be,setScissorTest:xe,activeTexture:Se,bindTexture:Ce,unbindTexture:we,compressedTexImage2D:Te,compressedTexImage3D:Ee,texImage2D:I,texImage3D:Ne,pixelStorei:Fe,getParameter:Pe,updateUBOMapping:R,uniformBlockBinding:Le,texStorage2D:je,texStorage3D:Me,texSubImage2D:De,texSubImage3D:Oe,compressedTexSubImage2D:ke,compressedTexSubImage3D:Ae,scissor:L,viewport:Ie,reset:z}}function Sl(l,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new U,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Ke(`canvas`)}function T(e,t,n){let r=1,i=Pe(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),B(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&B(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function D(e){return e.generateMipmaps}function O(e){l.generateMipmap(e)}function k(e){return e.isWebGLCubeRenderTarget?l.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?l.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?l.TEXTURE_2D_ARRAY:l.TEXTURE_2D}function A(e,t,n,r,i,a=!1){if(e!==null){if(l[e]!==void 0)return l[e];B(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let o;r&&(o=u.get(`EXT_texture_norm16`),o||B(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let s=t;if(t===l.RED&&(n===l.FLOAT&&(s=l.R32F),n===l.HALF_FLOAT&&(s=l.R16F),n===l.UNSIGNED_BYTE&&(s=l.R8),n===l.UNSIGNED_SHORT&&o&&(s=o.R16_EXT),n===l.SHORT&&o&&(s=o.R16_SNORM_EXT)),t===l.RED_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.R8UI),n===l.UNSIGNED_SHORT&&(s=l.R16UI),n===l.UNSIGNED_INT&&(s=l.R32UI),n===l.BYTE&&(s=l.R8I),n===l.SHORT&&(s=l.R16I),n===l.INT&&(s=l.R32I)),t===l.RG&&(n===l.FLOAT&&(s=l.RG32F),n===l.HALF_FLOAT&&(s=l.RG16F),n===l.UNSIGNED_BYTE&&(s=l.RG8),n===l.UNSIGNED_SHORT&&o&&(s=o.RG16_EXT),n===l.SHORT&&o&&(s=o.RG16_SNORM_EXT)),t===l.RG_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RG8UI),n===l.UNSIGNED_SHORT&&(s=l.RG16UI),n===l.UNSIGNED_INT&&(s=l.RG32UI),n===l.BYTE&&(s=l.RG8I),n===l.SHORT&&(s=l.RG16I),n===l.INT&&(s=l.RG32I)),t===l.RGB_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGB8UI),n===l.UNSIGNED_SHORT&&(s=l.RGB16UI),n===l.UNSIGNED_INT&&(s=l.RGB32UI),n===l.BYTE&&(s=l.RGB8I),n===l.SHORT&&(s=l.RGB16I),n===l.INT&&(s=l.RGB32I)),t===l.RGBA_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGBA8UI),n===l.UNSIGNED_SHORT&&(s=l.RGBA16UI),n===l.UNSIGNED_INT&&(s=l.RGBA32UI),n===l.BYTE&&(s=l.RGBA8I),n===l.SHORT&&(s=l.RGBA16I),n===l.INT&&(s=l.RGBA32I)),t===l.RGB&&(n===l.UNSIGNED_SHORT&&o&&(s=o.RGB16_EXT),n===l.SHORT&&o&&(s=o.RGB16_SNORM_EXT),n===l.UNSIGNED_INT_5_9_9_9_REV&&(s=l.RGB9_E5),n===l.UNSIGNED_INT_10F_11F_11F_REV&&(s=l.R11F_G11F_B10F)),t===l.RGBA){let e=a?Re:K.getTransfer(i);n===l.FLOAT&&(s=l.RGBA32F),n===l.HALF_FLOAT&&(s=l.RGBA16F),n===l.UNSIGNED_BYTE&&(s=e===`srgb`?l.SRGB8_ALPHA8:l.RGBA8),n===l.UNSIGNED_SHORT&&o&&(s=o.RGBA16_EXT),n===l.SHORT&&o&&(s=o.RGBA16_SNORM_EXT),n===l.UNSIGNED_SHORT_4_4_4_4&&(s=l.RGBA4),n===l.UNSIGNED_SHORT_5_5_5_1&&(s=l.RGB5_A1)}return(s===l.R16F||s===l.R32F||s===l.RG16F||s===l.RG32F||s===l.RGBA16F||s===l.RGBA32F)&&u.get(`EXT_color_buffer_float`),s}function ee(e,t){let n;return e?t===null||t===1014||t===1020?n=l.DEPTH24_STENCIL8:t===1015?n=l.DEPTH32F_STENCIL8:t===1012&&(n=l.DEPTH24_STENCIL8,B(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=l.DEPTH_COMPONENT24:t===1015?n=l.DEPTH_COMPONENT32F:t===1012&&(n=l.DEPTH_COMPONENT16),n}function j(e,t){return D(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function te(e){let t=e.target;t.removeEventListener(`dispose`,te),ne(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function M(e){let t=e.target;t.removeEventListener(`dispose`,M),re(t)}function ne(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&N(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function N(e){let t=f.get(e);l.deleteTexture(t.__webglTexture);let n=e.source,r=S.get(n);delete r[t.__cacheKey],h.memory.textures--}function re(e){let t=f.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),f.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)l.deleteFramebuffer(t.__webglFramebuffer[e][n]);else l.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)l.deleteFramebuffer(t.__webglFramebuffer[e]);else l.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&l.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&l.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&l.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let n=e.textures;for(let e=0,t=n.length;e<t;e++){let t=f.get(n[e]);t.__webglTexture&&(l.deleteTexture(t.__webglTexture),h.memory.textures--),f.remove(n[e])}f.remove(e)}let P=0;function ie(){P=0}function ae(){return P}function oe(e){P=e}function se(){let e=P;return e>=p.maxTextures&&B(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),P+=1,e}function ce(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function F(e,t){let n=f.get(e);if(e.isVideoTexture&&I(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)B(`WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)B(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ye(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D,n.__webglTexture,l.TEXTURE0+t)}function le(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){ye(n,e,t);return}e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null),d.bindTexture(l.TEXTURE_2D_ARRAY,n.__webglTexture,l.TEXTURE0+t)}function ue(e,t){let n=f.get(e);if(e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version){ye(n,e,t);return}d.bindTexture(l.TEXTURE_3D,n.__webglTexture,l.TEXTURE0+t)}function de(e,t){let n=f.get(e);if(e.isCubeDepthTexture!==!0&&e.version>0&&n.__version!==e.version){be(n,e,t);return}d.bindTexture(l.TEXTURE_CUBE_MAP,n.__webglTexture,l.TEXTURE0+t)}let fe={[e]:l.REPEAT,[t]:l.CLAMP_TO_EDGE,[n]:l.MIRRORED_REPEAT},pe={[r]:l.NEAREST,[i]:l.NEAREST_MIPMAP_NEAREST,[a]:l.NEAREST_MIPMAP_LINEAR,[o]:l.LINEAR,[s]:l.LINEAR_MIPMAP_NEAREST,[c]:l.LINEAR_MIPMAP_LINEAR},me={512:l.NEVER,519:l.ALWAYS,513:l.LESS,515:l.LEQUAL,514:l.EQUAL,518:l.GEQUAL,516:l.GREATER,517:l.NOTEQUAL};function he(e,t){if(t.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&B(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),l.texParameteri(e,l.TEXTURE_WRAP_S,fe[t.wrapS]),l.texParameteri(e,l.TEXTURE_WRAP_T,fe[t.wrapT]),(e===l.TEXTURE_3D||e===l.TEXTURE_2D_ARRAY)&&l.texParameteri(e,l.TEXTURE_WRAP_R,fe[t.wrapR]),l.texParameteri(e,l.TEXTURE_MAG_FILTER,pe[t.magFilter]),l.texParameteri(e,l.TEXTURE_MIN_FILTER,pe[t.minFilter]),t.compareFunction&&(l.texParameteri(e,l.TEXTURE_COMPARE_MODE,l.COMPARE_REF_TO_TEXTURE),l.texParameteri(e,l.TEXTURE_COMPARE_FUNC,me[t.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||f.get(t).__currentAnisotropy){let n=u.get(`EXT_texture_filter_anisotropic`);l.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,p.getMaxAnisotropy())),f.get(t).__currentAnisotropy=t.anisotropy}}}function ge(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,te));let r=t.source,i=S.get(r);i===void 0&&(i={},S.set(r,i));let a=ce(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:l.createTexture(),usedTimes:0},h.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&N(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function _e(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ve(e,t,n,r){let i=e.updateRanges;if(i.length===0)d.texSubImage2D(l.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=_e(r.start,t.width,4),c=_e(n.start,t.width,4);r.start<=o+1&&s===c&&_e(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let o=d.getParameter(l.UNPACK_ROW_LENGTH),s=d.getParameter(l.UNPACK_SKIP_PIXELS),c=d.getParameter(l.UNPACK_SKIP_ROWS);d.pixelStorei(l.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],o=Math.floor(a.start/4),s=Math.ceil(a.count/4),c=o%t.width,u=Math.floor(o/t.width),f=s;d.pixelStorei(l.UNPACK_SKIP_PIXELS,c),d.pixelStorei(l.UNPACK_SKIP_ROWS,u),d.texSubImage2D(l.TEXTURE_2D,0,c,u,f,1,n,r,t.data)}e.clearUpdateRanges(),d.pixelStorei(l.UNPACK_ROW_LENGTH,o),d.pixelStorei(l.UNPACK_SKIP_PIXELS,s),d.pixelStorei(l.UNPACK_SKIP_ROWS,c)}}function ye(e,t,n){let r=l.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=l.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=l.TEXTURE_3D);let i=ge(e,t),a=t.source;d.bindTexture(r,e.__webglTexture,l.TEXTURE0+n);let o=f.get(a);if(a.version!==o.__version||i===!0){if(d.activeTexture(l.TEXTURE0+n),!(typeof ImageBitmap<`u`&&t.image instanceof ImageBitmap)){let e=K.getPrimaries(K.workingColorSpace),n=t.colorSpace===``?null:K.getPrimaries(t.colorSpace),r=t.colorSpace===``||e===n?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,r)}d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment);let e=T(t.image,!1,p.maxTextureSize);e=Ne(t,e);let s=m.convert(t.format,t.colorSpace),c=m.convert(t.type),u=A(t.internalFormat,s,c,t.normalized,t.colorSpace,t.isVideoTexture);he(r,t);let f,h=t.mipmaps,g=t.isVideoTexture!==!0,_=o.__version===void 0||i===!0,v=a.dataReady,y=j(t,e);if(t.isDepthTexture)u=ee(t.format===E,t.type),_&&(g?d.texStorage2D(l.TEXTURE_2D,1,u,e.width,e.height):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,null));else if(t.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data);t.generateMipmaps=!1}else g?(_&&d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height),v&&ve(t,e,s,c)):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,e.data)}else if(t.isCompressedTexture){if(t.isCompressedArrayTexture){g&&_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,e.depth);for(let n=0,r=h.length;n<r;n++)if(f=h[n],t.format!==1023){if(s!==null){if(g){if(v){if(t.layerUpdates.size>0){let e=_o(f.width,f.height,t.format,t.type);for(let r of t.layerUpdates){let t=f.data.subarray(r*e/f.data.BYTES_PER_ELEMENT,(r+1)*e/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,r,f.width,f.height,1,s,t)}}else d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,f.data)}}else d.compressedTexImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,f.data,0,0)}else B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,c,f.data):d.texImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,s,c,f.data);t.layerUpdates.size>0&&t.clearLayerUpdates()}else{g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,n=h.length;e<n;e++)f=h[e],t.format===1023?g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data):s===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,f.data):d.compressedTexImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,f.data)}}else if(t.isDataArrayTexture){if(g){if(_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,e.width,e.height,e.depth),v){if(t.layerUpdates.size>0){let n=_o(e.width,e.height,t.format,t.type);for(let r of t.layerUpdates){let t=e.data.subarray(r*n/e.data.BYTES_PER_ELEMENT,(r+1)*n/e.data.BYTES_PER_ELEMENT);d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,s,c,t)}t.clearLayerUpdates()}else d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)}}else d.texImage3D(l.TEXTURE_2D_ARRAY,0,u,e.width,e.height,e.depth,0,s,c,e.data)}else if(t.isData3DTexture)g?(_&&d.texStorage3D(l.TEXTURE_3D,y,u,e.width,e.height,e.depth),v&&d.texSubImage3D(l.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)):d.texImage3D(l.TEXTURE_3D,0,u,e.width,e.height,e.depth,0,s,c,e.data);else if(t.isFramebufferTexture){if(_){if(g)d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height);else{let t=e.width,n=e.height;for(let e=0;e<y;e++)d.texImage2D(l.TEXTURE_2D,e,u,t,n,0,s,c,null),t>>=1,n>>=1}}}else if(t.isHTMLTexture){if(`texElementImage2D`in l){let n=l.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),e.parentNode!==n){n.appendChild(e),b.add(t),n.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(l.texElementImage2D.length===3)l.texElementImage2D(l.TEXTURE_2D,l.RGBA8,e);else{let t=l.RGBA,n=l.RGBA,r=l.UNSIGNED_BYTE;l.texElementImage2D(l.TEXTURE_2D,0,t,n,r,e)}l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let e=Pe(h[0]);d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height)}for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,s,c,f):d.texImage2D(l.TEXTURE_2D,e,u,s,c,f);t.generateMipmaps=!1}else if(g){if(_){let t=Pe(e);d.texStorage2D(l.TEXTURE_2D,y,u,t.width,t.height)}v&&d.texSubImage2D(l.TEXTURE_2D,0,0,0,s,c,e)}else d.texImage2D(l.TEXTURE_2D,0,u,s,c,e);D(t)&&O(r),o.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function be(e,t,n){if(t.image.length!==6)return;let r=ge(e,t),i=t.source;d.bindTexture(l.TEXTURE_CUBE_MAP,e.__webglTexture,l.TEXTURE0+n);let a=f.get(i);if(i.version!==a.__version||r===!0){d.activeTexture(l.TEXTURE0+n);let e=K.getPrimaries(K.workingColorSpace),o=t.colorSpace===``?null:K.getPrimaries(t.colorSpace),s=t.colorSpace===``||e===o?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,s);let c=t.isCompressedTexture||t.image[0].isCompressedTexture,u=t.image[0]&&t.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!c&&!u?f[e]=T(t.image[e],!0,p.maxCubemapSize):f[e]=u?t.image[e].image:t.image[e],f[e]=Ne(t,f[e]);let h=f[0],g=m.convert(t.format,t.colorSpace),_=m.convert(t.type),v=A(t.internalFormat,g,_,t.normalized,t.colorSpace),y=t.isVideoTexture!==!0,b=a.__version===void 0||r===!0,x=i.dataReady,S=j(t,h);he(l.TEXTURE_CUBE_MAP,t);let C;if(c){y&&b&&d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let e=0;e<6;e++){C=f[e].mipmaps;for(let n=0;n<C.length;n++){let r=C[n];t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,_,r.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,g,_,r.data):g===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,r.data):d.compressedTexImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,r.data)}}}else{if(C=t.mipmaps,y&&b){C.length>0&&S++;let e=Pe(f[0]);d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,e.width,e.height)}for(let e=0;e<6;e++)if(u){y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,f[e].width,f[e].height,g,_,f[e].data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,f[e].width,f[e].height,0,g,_,f[e].data);for(let t=0;t<C.length;t++){let n=C[t].image[e].image;y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,g,_,n.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,n.width,n.height,0,g,_,n.data)}}else{y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,f[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,g,_,f[e]);for(let t=0;t<C.length;t++){let n=C[t];y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,g,_,n.image[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,g,_,n.image[e])}}}D(t)&&O(l.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function xe(e,t,n,r,i,a){let o=m.convert(n.format,n.colorSpace),s=m.convert(n.type),c=A(n.internalFormat,o,s,n.normalized,n.colorSpace),u=f.get(t),p=f.get(n);if(p.__renderTarget=t,!u.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===l.TEXTURE_3D||i===l.TEXTURE_2D_ARRAY?d.texImage3D(i,a,c,e,n,t.depth,0,o,s,null):d.texImage2D(i,a,c,e,n,0,o,s,null)}d.bindFramebuffer(l.FRAMEBUFFER,e),Me(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,r,i,p.__webglTexture,0,je(t)):(i===l.TEXTURE_2D||i>=l.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=l.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&l.framebufferTexture2D(l.FRAMEBUFFER,r,i,p.__webglTexture,a),d.bindFramebuffer(l.FRAMEBUFFER,null)}function Se(e,t,n){if(l.bindRenderbuffer(l.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=ee(t.stencilBuffer,i),o=t.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;Me(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,je(t),a,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,je(t),a,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,a,t.width,t.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,o,l.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=m.convert(i.format,i.colorSpace),o=m.convert(i.type),s=A(i.internalFormat,a,o,i.normalized,i.colorSpace);Me(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,je(t),s,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,je(t),s,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,s,t.width,t.height)}}l.bindRenderbuffer(l.RENDERBUFFER,null)}function Ce(e,t,n){let r=t.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(l.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let i=f.get(t.depthTexture);if(i.__renderTarget=t,(!i.__webglTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height)&&(t.depthTexture.image.width=t.width,t.depthTexture.image.height=t.height,t.depthTexture.needsUpdate=!0),r){if(i.__webglInit===void 0&&(i.__webglInit=!0,t.depthTexture.addEventListener(`dispose`,te)),i.__webglTexture===void 0){i.__webglTexture=l.createTexture(),d.bindTexture(l.TEXTURE_CUBE_MAP,i.__webglTexture),he(l.TEXTURE_CUBE_MAP,t.depthTexture);let e=m.convert(t.depthTexture.format),n=m.convert(t.depthTexture.type),r;t.depthTexture.format===1026?r=l.DEPTH_COMPONENT24:t.depthTexture.format===1027&&(r=l.DEPTH24_STENCIL8);for(let i=0;i<6;i++)l.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+i,0,r,t.width,t.height,0,e,n,null)}}else F(t.depthTexture,0);let a=i.__webglTexture,o=je(t),s=r?l.TEXTURE_CUBE_MAP_POSITIVE_X+n:l.TEXTURE_2D,c=t.depthTexture.format===1027?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;if(t.depthTexture.format===1026)Me(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else if(t.depthTexture.format===1027)Me(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function we(e){let t=f.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer){if(n)for(let n=0;n<6;n++)Ce(t.__webglFramebuffer[n],e,n);else{let n=e.texture.mipmaps;n&&n.length>0?Ce(t.__webglFramebuffer[0],e,0):Ce(t.__webglFramebuffer,e,0)}}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=l.createRenderbuffer(),Se(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];l.bindRenderbuffer(l.RENDERBUFFER,i),l.framebufferRenderbuffer(l.FRAMEBUFFER,r,l.RENDERBUFFER,i)}}else{let n=e.texture.mipmaps;if(n&&n.length>0?d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[0]):d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=l.createRenderbuffer(),Se(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;l.bindRenderbuffer(l.RENDERBUFFER,r),l.framebufferRenderbuffer(l.FRAMEBUFFER,n,l.RENDERBUFFER,r)}}d.bindFramebuffer(l.FRAMEBUFFER,null)}function Te(e,t,n){let r=f.get(e);t!==void 0&&xe(r.__webglFramebuffer,e,e.texture,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,0),n!==void 0&&we(e)}function Ee(e){let t=e.texture,n=f.get(e),r=f.get(t);e.addEventListener(`dispose`,M);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,o=i.length>1;if(o||(r.__webglTexture===void 0&&(r.__webglTexture=l.createTexture()),r.__version=t.version,h.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=l.createFramebuffer()}else n.__webglFramebuffer[e]=l.createFramebuffer()}else{if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=l.createFramebuffer()}else n.__webglFramebuffer=l.createFramebuffer();if(o)for(let e=0,t=i.length;e<t;e++){let t=f.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=l.createTexture(),h.memory.textures++)}if(e.samples>0&&Me(e)===!1){n.__webglMultisampledFramebuffer=l.createFramebuffer(),n.__webglColorRenderbuffer=[],d.bindFramebuffer(l.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=l.createRenderbuffer(),l.bindRenderbuffer(l.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=m.convert(r.format,r.colorSpace),o=m.convert(r.type),s=A(r.internalFormat,a,o,r.normalized,r.colorSpace,e.isXRRenderTarget===!0),c=je(e);l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,e.width,e.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+t,l.RENDERBUFFER,n.__webglColorRenderbuffer[t])}l.bindRenderbuffer(l.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=l.createRenderbuffer(),Se(n.__webglDepthRenderbuffer,e,!0)),d.bindFramebuffer(l.FRAMEBUFFER,null)}}if(a){d.bindTexture(l.TEXTURE_CUBE_MAP,r.__webglTexture),he(l.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps&&t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)xe(n.__webglFramebuffer[r][i],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else xe(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);D(t)&&O(l.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(o){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=f.get(r),o=l.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(o=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(o,a.__webglTexture),he(o,r),xe(n.__webglFramebuffer,e,r,l.COLOR_ATTACHMENT0+t,o,0),D(r)&&O(o)}d.unbindTexture()}else{let i=l.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(i,r.__webglTexture),he(i,t),t.mipmaps&&t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)xe(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,i,r);else xe(n.__webglFramebuffer,e,t,l.COLOR_ATTACHMENT0,i,0);D(t)&&O(i),d.unbindTexture()}e.depthBuffer&&we(e)}function De(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(D(r)){let t=k(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),O(t),d.unbindTexture()}}}let Oe=[],ke=[];function Ae(e){if(e.samples>0){if(Me(e)===!1){let t=e.textures,n=e.width,r=e.height,i=l.COLOR_BUFFER_BIT,a=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,o=f.get(e),s=t.length>1;if(s)for(let e=0;e<t.length;e++)d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,null),d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,null,0);d.bindFramebuffer(l.READ_FRAMEBUFFER,o.__webglMultisampledFramebuffer);let c=e.texture.mipmaps;c&&c.length>0?d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer[0]):d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=l.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=l.STENCIL_BUFFER_BIT)),s){l.framebufferRenderbuffer(l.READ_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.RENDERBUFFER,o.__webglColorRenderbuffer[c]);let e=f.get(t[c]).__webglTexture;l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,e,0)}l.blitFramebuffer(0,0,n,r,0,0,n,r,i,l.NEAREST),_===!0&&(Oe.length=0,ke.length=0,Oe.push(l.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&(Oe.push(a),ke.push(a),l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,ke)),l.invalidateFramebuffer(l.READ_FRAMEBUFFER,Oe))}if(d.bindFramebuffer(l.READ_FRAMEBUFFER,null),d.bindFramebuffer(l.DRAW_FRAMEBUFFER,null),s)for(let e=0;e<t.length;e++){d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,o.__webglColorRenderbuffer[e]);let n=f.get(t[e]).__webglTexture;d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,n,0)}d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&_){let t=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,[t])}}}function je(e){return Math.min(p.maxSamples,e.samples)}function Me(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function I(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Ne(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(K.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&B(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):V(`WebGLTextures: Unsupported texture color space:`,n)),t}function Pe(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=se,this.resetTextureUnits=ie,this.getTextureUnits=ae,this.setTextureUnits=oe,this.setTexture2D=F,this.setTexture2DArray=le,this.setTexture3D=ue,this.setTextureCube=de,this.rebindTextures=Te,this.setupRenderTarget=Ee,this.updateRenderTargetMipmap=De,this.updateMultisampleRenderTarget=Ae,this.setupDepthRenderbuffer=we,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=Me,this.isReversedDepthBuffer=function(){return d.buffers.depth.getReversed()}}function Cl(e,t){function n(n,r=``){let i,a=K.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var wl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Tl=`
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

}`,El=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Hi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new pa({vertexShader:wl,fragmentShader:Tl,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new mi(new na(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Dl=class extends et{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,d=null,f=null,p=null,h=null,g=typeof XRWebGLBinding<`u`,_=new El,v={},b=t.getContextAttributes(),x=null,S=null,C=[],D=[],O=new U,k=null,A=null,ee=new Xa;ee.viewport=new Wt;let j=new Xa;j.viewport=new Wt;let te=[ee,j],M=new to,ne=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new Tn,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new Tn,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new Tn,C[e]=t),t.getHandSpace()};function re(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function P(){r.removeEventListener(`select`,re),r.removeEventListener(`selectstart`,re),r.removeEventListener(`selectend`,re),r.removeEventListener(`squeeze`,re),r.removeEventListener(`squeezestart`,re),r.removeEventListener(`squeezeend`,re),r.removeEventListener(`end`,P),r.removeEventListener(`inputsourceschange`,ie);for(let e=0;e<C.length;e++){let t=D[e];t!==null&&(D[e]=null,C[e].disconnect(t))}ne=null,N=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,de.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(O.width,O.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,re),r.addEventListener(`selectstart`,re),r.addEventListener(`selectend`,re),r.addEventListener(`squeeze`,re),r.addEventListener(`squeezestart`,re),r.addEventListener(`squeezeend`,re),r.addEventListener(`end`,P),r.addEventListener(`inputsourceschange`,ie),b.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(O),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?E:T,a=b.stencil?y:m);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Kt(f.textureWidth,f.textureHeight,{format:w,type:l,depthTexture:new Bi(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Kt(p.framebufferWidth,p.framebufferHeight,{format:w,type:l,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),de.setContext(r),de.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function ie(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let ae=new W,oe=new W;function se(e,t,n){ae.setFromMatrixPosition(t.matrixWorld),oe.setFromMatrixPosition(n.matrixWorld);let r=ae.distanceTo(oe),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ce(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),M.near=j.near=ee.near=t,M.far=j.far=ee.far=n,(ne!==M.near||N!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),ne=M.near,N=M.far),M.layers.mask=e.layers.mask|6,ee.layers.mask=M.layers.mask&-5,j.layers.mask=M.layers.mask&-3;let i=e.parent,a=M.cameras;ce(M,i);for(let e=0;e<a.length;e++)ce(a[e],i);a.length===2?se(M,ee,j):M.projectionMatrix.copy(ee.projectionMatrix),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),F(e,M,i)};function F(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=it*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(M)},this.getCameraTexture=function(e){return v[e]};let le=null;function ue(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==M.cameras.length&&(M.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=te[n];o===void 0&&(o=new Xa,o.layers.enable(n),o.viewport=new Wt,te[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(M.matrix.copy(o.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),i===!0&&M.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Hi,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=D[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}le&&le(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let de=new yo;de.setAnimationLoop(ue),this.setAnimationLoop=function(e){le=e},this.dispose=function(){}}},Ol=new q,kl=new G;kl.set(-1,0,0,0,1,0,0,0,1);function Al(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,la(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Ol.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(kl),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function jl(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return V(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?B(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):B(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var Ml=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Nl=null;function Pl(){return Nl===null&&(Nl=new _i(Ml,16,16,k,g),Nl.name=`DFG_LUT`,Nl.minFilter=o,Nl.magFilter=o,Nl.wrapS=t,Nl.wrapT=t,Nl.generateMipmaps=!1,Nl.needsUpdate=!0),Nl}var Fl=class{constructor(e={}){let{canvas:t=qe(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:b=l}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);x=n.getContextAttributes().alpha}else x=a;let S=b,C=new Set([ee,A,O]),w=new Set([l,m,f,y,_,v]),T=new Uint32Array(4),E=new Int32Array(4),D=new W,k=null,j=null,te=[],M=[],ne=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,re=!1,P=null,ie=null,ae=null,oe=null;this._outputColorSpace=Le;let se=0,ce=0,F=null,le=-1,ue=null,de=new Wt,fe=new Wt,pe=null,me=new J(0),he=0,ge=t.width,_e=t.height,ve=1,ye=null,be=null,xe=new Wt(0,0,ge,_e),Se=new Wt(0,0,ge,_e),Ce=!1,we=new Ai,Te=!1,Ee=!1,De=new q,Oe=new W,ke=new Wt,Ae={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},je=!1;function Me(){return F===null?ve:1}let I=n;function Ne(e,n){return t.getContext(e,n)}let Pe,Fe,L,Ie,R,z,Re,ze,Be,Ve,He,We,Ge,Ke,Je,Xe,Ze,$e,et,tt,nt,rt,it;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:p};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,ot,!1),t.addEventListener(`webglcontextrestored`,st,!1),t.addEventListener(`webglcontextcreationerror`,ct,!1),I===null){let t=`webgl2`;if(I=Ne(t,e),I===null)throw Ne(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}at()}catch(e){throw t.removeEventListener(`webglcontextlost`,ot,!1),t.removeEventListener(`webglcontextrestored`,st,!1),t.removeEventListener(`webglcontextcreationerror`,ct,!1),V(`WebGLRenderer: `+e.message),e}function at(){Pe=new $o(I),Pe.init(),nt=new Cl(I,Pe),Fe=new Oo(I,Pe,e,nt),L=new xl(I,Pe),Fe.reversedDepthBuffer&&h&&L.buffers.depth.setReversed(!0),ie=I.createFramebuffer(),ae=I.createFramebuffer(),oe=I.createFramebuffer(),Ie=new ns(I),R=new tl,z=new Sl(I,Pe,L,R,Fe,nt,Ie),Re=new Qo(N),ze=new bo(I),rt=new Eo(I,ze),Be=new es(I,ze,Ie,rt),Ve=new is(I,Be,ze,rt,Ie),$e=new rs(I,Fe,z),Je=new ko(R),He=new el(N,Re,Pe,Fe,rt,Je),We=new Al(N,R),Ge=new al,Ke=new fl(Pe),Ze=new To(N,Re,L,Ve,x,s),Xe=new bl(N,Ve,Fe),it=new jl(I,Ie,Fe,L),et=new Do(I,Pe,Ie),tt=new ts(I,Pe,Ie),Ie.programs=He.programs,N.capabilities=Fe,N.extensions=Pe,N.properties=R,N.renderLists=Ge,N.shadowMap=Xe,N.state=L,N.info=Ie}S!==1009&&(ne=new os(S,t.width,t.height,o,r,i));let H=new Dl(N,I);this.xr=H,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let e=Pe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Pe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ve},this.setPixelRatio=function(e){e!==void 0&&(ve=e,this.setSize(ge,_e,!1))},this.getSize=function(e){return e.set(ge,_e)},this.setSize=function(e,n,r=!0){if(H.isPresenting){B(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ge=e,_e=n,t.width=Math.floor(e*ve),t.height=Math.floor(n*ve),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),ne!==null&&ne.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ge*ve,_e*ve).floor()},this.setDrawingBufferSize=function(e,n,r){ge=e,_e=n,ve=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009){V(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){B(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}ne.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(de)},this.getViewport=function(e){return e.copy(xe)},this.setViewport=function(e,t,n,r){e.isVector4?xe.set(e.x,e.y,e.z,e.w):xe.set(e,t,n,r),L.viewport(de.copy(xe).multiplyScalar(ve).round())},this.getScissor=function(e){return e.copy(Se)},this.setScissor=function(e,t,n,r){e.isVector4?Se.set(e.x,e.y,e.z,e.w):Se.set(e,t,n,r),L.scissor(fe.copy(Se).multiplyScalar(ve).round())},this.getScissorTest=function(){return Ce},this.setScissorTest=function(e){L.setScissorTest(Ce=e)},this.setOpaqueSort=function(e){ye=e},this.setTransparentSort=function(e){be=e},this.getClearColor=function(e){return e.copy(Ze.getClearColor())},this.setClearColor=function(){Ze.setClearColor(...arguments)},this.getClearAlpha=function(){return Ze.getClearAlpha()},this.setClearAlpha=function(){Ze.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(F!==null){let t=F.texture.format;e=C.has(t)}if(e){let e=F.texture.type,t=w.has(e),n=Ze.getClearColor(),r=Ze.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,I.clearBufferuiv(I.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,I.clearBufferiv(I.COLOR,0,E))}else r|=I.COLOR_BUFFER_BIT}t&&(r|=I.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&I.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),P=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ot,!1),t.removeEventListener(`webglcontextrestored`,st,!1),t.removeEventListener(`webglcontextcreationerror`,ct,!1),Ze.dispose(),Ge.dispose(),Ke.dispose(),R.dispose(),Re.dispose(),Ve.dispose(),rt.dispose(),it.dispose(),He.dispose(),H.dispose(),H.removeEventListener(`sessionstart`,ht),H.removeEventListener(`sessionend`,gt),_t.stop()};function ot(e){e.preventDefault(),Ye(`WebGLRenderer: Context Lost.`),re=!0}function st(){Ye(`WebGLRenderer: Context Restored.`),re=!1;let e=Ie.autoReset,t=Xe.enabled,n=Xe.autoUpdate,r=Xe.needsUpdate,i=Xe.type;at(),Ie.autoReset=e,Xe.enabled=t,Xe.autoUpdate=n,Xe.needsUpdate=r,Xe.type=i}function ct(e){V(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function lt(e){let t=e.target;t.removeEventListener(`dispose`,lt),ut(t)}function ut(e){dt(e),R.remove(e)}function dt(e){let t=R.get(e).programs;t!==void 0&&(t.forEach(function(e){He.releaseProgram(e)}),e.isShaderMaterial&&He.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Ae);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=U(e,t,n,r,i);L.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Be.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;rt.setup(i,r,s,n,c);let h,g=et;if(c!==null&&(h=ze.get(c),g=tt,g.setIndex(h)),i.isMesh)r.wireframe===!0?(L.setLineWidth(r.wireframeLinewidth*Me()),g.setMode(I.LINES)):g.setMode(I.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),L.setLineWidth(e*Me()),i.isLineSegments?g.setMode(I.LINES):i.isLineLoop?g.setMode(I.LINE_LOOP):g.setMode(I.LINE_STRIP)}else i.isPoints?g.setMode(I.POINTS):i.isSprite&&g.setMode(I.TRIANGLES);if(i.isBatchedMesh){if(Pe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ze.get(c).bytesPerElement:1,o=R.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(I,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ft(e,t,n,r){P!==null&&e.isNodeMaterial&&P.setObject(r,e),Te===!0&&Je.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Ct(e,t,r),e.side=0,e.needsUpdate=!0,Ct(e,t,r),e.side=2):Ct(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),P!==null&&P.renderStart(e,t,n),j=Ke.get(n),j.init(t),M.push(j),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(j.pushLight(e),e.castShadow&&j.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(j.pushLight(e),e.castShadow&&j.pushShadow(e))}),j.setupLights(),P!==null&&P.updateLights(j.state.lightsArray),Ee=this.localClippingEnabled,Te=Je.init(this.clippingPlanes,Ee),Te===!0&&Je.setGlobalState(this.clippingPlanes,t),P!==null&&Xe.render(j.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ft(o,n,t,e),r.add(o)}else ft(i,n,t,e),r.add(i)}}),j=M.pop(),P!==null&&P.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){let t=R.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}Pe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let pt=null;function mt(e){pt&&pt(e)}function ht(){_t.stop()}function gt(){_t.start()}let _t=new yo;_t.setAnimationLoop(mt),typeof self<`u`&&_t.setContext(self),this.setAnimationLoop=function(e){pt=e,H.setAnimationLoop(e),e===null?_t.stop():_t.start()},H.addEventListener(`sessionstart`,ht),H.addEventListener(`sessionend`,gt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){V(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(re===!0)return;P!==null&&P.renderStart(e,t);let n=H.enabled===!0&&H.isPresenting===!0,r=ne!==null&&(F===null||n)&&ne.begin(N,F);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),H.enabled===!0&&H.isPresenting===!0&&(ne===null||ne.isCompositing()===!1)&&(H.cameraAutoUpdate===!0&&H.updateCamera(t),t=H.getCamera()),e.isScene===!0&&e.onBeforeRender(N,e,t,F),j=Ke.get(e,M.length),j.init(t),j.state.textureUnits=z.getTextureUnits(),M.push(j),De.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),we.setFromProjectionMatrix(De,Ue,t.reversedDepth),Ee=this.localClippingEnabled,Te=Je.init(this.clippingPlanes,Ee),k=Ge.get(e,te.length),k.init(),te.push(k),H.enabled===!0&&H.isPresenting===!0){let e=N.xr.getDepthSensingMesh();e!==null&&vt(e,t,-1/0,N.sortObjects)}vt(e,t,0,N.sortObjects),k.finish(),P!==null&&P.updateLights(j.state.lightsArray),N.sortObjects===!0&&k.sort(ye,be),je=H.enabled===!1||H.isPresenting===!1||H.hasDepthSensing()===!1,je&&Ze.addToRenderList(k,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Te===!0&&Je.beginShadows();let i=j.state.shadowsArray;if(Xe.render(i,e,t),Te===!0&&Je.endShadows(),(r&&ne.hasRenderPass())===!1){let n=k.opaque,r=k.transmissive;if(j.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];bt(n,r,e,a)}je&&Ze.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];yt(k,e,n,n.viewport)}}else r.length>0&&bt(n,r,e,t),je&&Ze.render(e),yt(k,e,t)}F!==null&&ce===0&&(z.updateMultisampleRenderTarget(F),z.updateRenderTargetMipmap(F)),r&&ne.end(N),e.isScene===!0&&e.onAfterRender(N,e,t),rt.resetDefaultState(),le=-1,ue=null,M.pop(),M.length>0?(j=M[M.length-1],z.setTextureUnits(j.state.textureUnits),Te===!0&&Je.setGlobalState(N.clippingPlanes,j.state.camera)):j=null,te.pop(),k=te.length>0?te[te.length-1]:null,P!==null&&P.renderEnd()};function vt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)j.pushLightProbeGrid(e);else if(e.isLight)j.pushLight(e),e.castShadow&&j.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(we)){r&&ke.setFromMatrixPosition(e.matrixWorld).applyMatrix4(De);let i=Ve.update(e),a=e.material;a.visible&&k.push(e,i,a,n,ke.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(we))){let i=Ve.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),ke.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ke.copy(e.boundingSphere.center)),ke.applyMatrix4(e.matrixWorld).applyMatrix4(De)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&k.push(e,i,c,n,ke.z,s,t)}}else a.visible&&k.push(e,i,a,n,ke.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)vt(i[e],t,n,r)}function yt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;j.setupLightsView(n),Te===!0&&Je.setGlobalState(N.clippingPlanes,n),r&&L.viewport(de.copy(r)),i.length>0&&xt(i,t,n),a.length>0&&xt(a,t,n),o.length>0&&xt(o,t,n),L.buffers.depth.setTest(!0),L.buffers.depth.setMask(!0),L.buffers.color.setMask(!0),L.setPolygonOffset(!1)}function bt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(j.state.transmissionRenderTarget[r.id]===void 0){let e=Pe.has(`EXT_color_buffer_half_float`)||Pe.has(`EXT_color_buffer_float`);j.state.transmissionRenderTarget[r.id]=new Kt(1,1,{generateMipmaps:!0,type:e?g:l,minFilter:c,samples:Math.max(4,Fe.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:K.workingColorSpace})}let a=j.state.transmissionRenderTarget[r.id],o=r.viewport||de;a.setSize(o.z*N.transmissionResolutionScale,o.w*N.transmissionResolutionScale);let s=N.getRenderTarget(),u=N.getActiveCubeFace(),d=N.getActiveMipmapLevel();N.setRenderTarget(a),N.getClearColor(me),he=N.getClearAlpha(),he<1&&N.setClearColor(16777215,.5),N.clear(),je&&Ze.render(n);let f=N.toneMapping;N.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),j.setupLightsView(r),Te===!0&&Je.setGlobalState(N.clippingPlanes,r),xt(e,n,r),z.updateMultisampleRenderTarget(a),z.updateRenderTargetMipmap(a),Pe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,St(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(z.updateMultisampleRenderTarget(a),z.updateRenderTargetMipmap(a))}N.setRenderTarget(s,u,d),N.setClearColor(me,he),p!==void 0&&(r.viewport=p),N.toneMapping=f}function xt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&St(o,t,n,s,l,c)}}function St(e,t,n,r,i,a){P!==null&&i.isNodeMaterial&&P.setObject(e,i),e.onBeforeRender(N,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(N,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,N.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,N.renderBufferDirect(n,t,r,i,e,a),i.side=2):N.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(N,t,n,r,i,a)}function Ct(e,t,n){t.isScene!==!0&&(t=Ae);let r=R.get(e),i=j.state.lights,a=j.state.shadowsArray,o=i.state.version,s=He.getParameters(e,i.state,a,t,n,j.state.lightProbeGridArray),c=He.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Re.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,lt),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Tt(e,s),d}else s.uniforms=He.getUniforms(e),P!==null&&e.isNodeMaterial&&P.build(e,n,s),e.onBeforeCompile(s,N),d=He.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Je.uniform),Tt(e,s),r.needsLights=Ot(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=j.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function wt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=pc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Tt(e,t){let n=R.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Et(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function U(e,t,n,r,i){t.isScene!==!0&&(t=Ae),z.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=F===null?N.outputColorSpace:F.isXRRenderTarget===!0?F.texture.colorSpace:K.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Re.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(F===null||F.isXRRenderTarget===!0)&&(h=N.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=R.get(r),y=j.state.lights;if(Te===!0&&(Ee===!0||e!==ue)){let t=e===ue&&r.id===le;Je.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Je.numPlanes||v.numIntersection!==Je.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=j.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=Ct(r,t,i),P&&r.isNodeMaterial&&P.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(L.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==le&&(le=r.id,C=!0),v.needsLights){let e=Et(j.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||ue!==e){L.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(I,`projectionMatrix`,e.projectionMatrix),T.setValue(I,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(I,Oe.setFromMatrixPosition(e.matrixWorld)),Fe.logarithmicDepthBuffer&&T.setValue(I,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(I,`isOrthographic`,e.isOrthographicCamera===!0),ue!==e&&(ue=e,C=!0,w=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&T.setValue(I,`sunShadowMap`,y.state.sunShadowMap,z),y.state.directionalShadowMap.length>0&&T.setValue(I,`directionalShadowMap`,y.state.directionalShadowMap,z),y.state.spotShadowMap.length>0&&T.setValue(I,`spotShadowMap`,y.state.spotShadowMap,z),y.state.pointShadowMap.length>0&&T.setValue(I,`pointShadowMap`,y.state.pointShadowMap,z)),i.isSkinnedMesh){T.setOptional(I,i,`bindMatrix`),T.setOptional(I,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(I,`boneTexture`,e.boneTexture,z))}i.isBatchedMesh&&(T.setOptional(I,i,`batchingTexture`),T.setValue(I,`batchingTexture`,i._matricesTexture,z),T.setOptional(I,i,`batchingIdTexture`),T.setValue(I,`batchingIdTexture`,i._indirectTexture,z),T.setOptional(I,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(I,`batchingColorTexture`,i._colorsTexture,z));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&$e.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(I,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=Pl()),C){if(T.setValue(I,`toneMappingExposure`,N.toneMappingExposure),v.needsLights&&Dt(E,w),a&&r.fog===!0&&We.refreshFogUniforms(E,a),We.refreshMaterialUniforms(E,r,ve,_e,j.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}pc.upload(I,wt(v),E,z)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(pc.upload(I,wt(v),E,z),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(I,`center`,i.center),T.setValue(I,`modelViewMatrix`,i.modelViewMatrix),T.setValue(I,`normalMatrix`,i.normalMatrix),T.setValue(I,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];it.update(n,x),it.bind(n,x)}}return x}function Dt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Ot(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return se},this.getActiveMipmapLevel=function(){return ce},this.getRenderTarget=function(){return F},this.setRenderTargetTextures=function(e,t,n){let r=R.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),R.get(e.texture).__webglTexture=t,R.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=R.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){F=e,se=t,ce=n;let r=null,i=!1,a=!1;if(e){let o=R.get(e);if(o.__useDefaultFramebuffer!==void 0){L.bindFramebuffer(I.FRAMEBUFFER,o.__webglFramebuffer),de.copy(e.viewport),fe.copy(e.scissor),pe=e.scissorTest,L.viewport(de),L.scissor(fe),L.setScissorTest(pe),le=-1;return}if(o.__webglFramebuffer===void 0)z.setupRenderTarget(e);else if(o.__hasExternalTextures)z.rebindTextures(e,R.get(e.texture).__webglTexture,R.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&R.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);z.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=R.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&z.useMultisampledRTT(e)===!1?R.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,de.copy(e.viewport),fe.copy(e.scissor),pe=e.scissorTest}else de.copy(xe).multiplyScalar(ve).floor(),fe.copy(Se).multiplyScalar(ve).floor(),pe=Ce;if(n!==0&&(r=ie),L.bindFramebuffer(I.FRAMEBUFFER,r)&&L.drawBuffers(e,r),L.viewport(de),L.scissor(fe),L.setScissorTest(pe),i){let r=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=R.get(e.textures[t]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,t.__webglTexture,n)}le=-1};function kt(e){let t=R.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Fe.textureFormatReadable(e.format),t.__typeReadable=Fe.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){L.bindFramebuffer(I.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s);let u=kt(o);if(u.__formatReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&I.readPixels(t,n,r,i,nt.convert(c),nt.convert(l),a)}finally{let e=F===null?null:R.get(F).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){L.bindFramebuffer(I.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s);let d=kt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,f),I.bufferData(I.PIXEL_PACK_BUFFER,a.byteLength,I.STREAM_READ),I.readPixels(t,n,r,i,nt.convert(l),nt.convert(u),0),I.bindBuffer(I.PIXEL_PACK_BUFFER,null);let p=F===null?null:R.get(F).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,p);let m=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Qe(I,m,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,f),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,a),I.bindBuffer(I.PIXEL_PACK_BUFFER,null),I.deleteBuffer(f),I.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;z.setTexture2D(e,0),I.copyTexSubImage2D(I.TEXTURE_2D,n,0,0,o,s,i,a),L.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=nt.convert(t.format),_=nt.convert(t.type),v;t.isData3DTexture?(z.setTexture3D(t,0),v=I.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(z.setTexture2DArray(t,0),v=I.TEXTURE_2D_ARRAY):(z.setTexture2D(t,0),v=I.TEXTURE_2D),L.activeTexture(I.TEXTURE0),L.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,t.flipY),L.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),L.pixelStorei(I.UNPACK_ALIGNMENT,t.unpackAlignment);let y=L.getParameter(I.UNPACK_ROW_LENGTH),b=L.getParameter(I.UNPACK_IMAGE_HEIGHT),x=L.getParameter(I.UNPACK_SKIP_PIXELS),S=L.getParameter(I.UNPACK_SKIP_ROWS),C=L.getParameter(I.UNPACK_SKIP_IMAGES);L.pixelStorei(I.UNPACK_ROW_LENGTH,h.width),L.pixelStorei(I.UNPACK_IMAGE_HEIGHT,h.height),L.pixelStorei(I.UNPACK_SKIP_PIXELS,l),L.pixelStorei(I.UNPACK_SKIP_ROWS,u),L.pixelStorei(I.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=R.get(e),r=R.get(t),h=R.get(n.__renderTarget),g=R.get(r.__renderTarget);L.bindFramebuffer(I.READ_FRAMEBUFFER,h.__webglFramebuffer),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(e).__webglTexture,i,d+n),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(t).__webglTexture,a,m+n)),I.blitFramebuffer(l,u,o,s,f,p,o,s,I.DEPTH_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||R.has(e)){let n=R.get(e),r=R.get(t);L.bindFramebuffer(I.READ_FRAMEBUFFER,ae),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,oe);for(let e=0;e<c;e++)w?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,n.__webglTexture,i),T?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,r.__webglTexture,a),i===0?T?I.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):I.copyTexSubImage2D(v,a,f,p,l,u,o,s):I.blitFramebuffer(l,u,o,s,f,p,o,s,I.COLOR_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?I.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h);L.pixelStorei(I.UNPACK_ROW_LENGTH,y),L.pixelStorei(I.UNPACK_IMAGE_HEIGHT,b),L.pixelStorei(I.UNPACK_SKIP_PIXELS,x),L.pixelStorei(I.UNPACK_SKIP_ROWS,S),L.pixelStorei(I.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&I.generateMipmap(v),L.unbindTexture()},this.initRenderTarget=function(e){R.get(e).__webglFramebuffer===void 0&&z.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?z.setTextureCube(e,0):e.isData3DTexture?z.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?z.setTexture2DArray(e,0):z.setTexture2D(e,0),L.unbindTexture()},this.resetState=function(){se=0,ce=0,F=null,L.reset(),rt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ue}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=K._getDrawingBufferColorSpace(e),t.unpackColorSpace=K._getUnpackColorSpace()}},Il={antialias:!0,maxPixelRatio:2,powerPreference:`high-performance`,clearColor:131336},Ll={fov:75,near:.1,far:2e3,position:{x:0,y:2.2,z:6},lookAt:{x:0,y:2.2,z:0}},Rl={maxDelta:.05},zl={enabled:!0,updateInterval:.5},Bl={steerSmoothing:.12,throttleSmoothing:.18,brakeSmoothing:.08,gamepadDeadzone:.15,gamepadTriggerThreshold:.05,hotkeys:{capture:`KeyC`,cameraProfile:`KeyV`,overlay:`KeyH`,fullscreen:`KeyF`,mute:`KeyM`,pause:`Escape`,comfort:`KeyR`,theme:`KeyT`,quality:`KeyQ`}},Vl={preset:`auto`,presets:{high:{maxPixelRatio:2,antialias:!0,postprocess:!0,bloomScale:.5,trafficScale:1,starScale:1},medium:{maxPixelRatio:1.5,antialias:!0,postprocess:!0,bloomScale:.5,trafficScale:.8,starScale:.8},low:{maxPixelRatio:1,antialias:!1,postprocess:!0,bloomScale:.35,trafficScale:.6,starScale:.55},minimum:{maxPixelRatio:1,antialias:!1,postprocess:!1,bloomScale:.35,trafficScale:.5,starScale:.4}},auto:{phoneShortEdge:500,lowMemory:4,lowCores:6}},Hl={band:{height:.55,width:.4},steerSplit:.5,bothSidesBrake:!0,autoThrottle:!0},Ul={resizeDebounce:.15,minChange:2,useVisualViewport:!0,fullscreen:{onFirstTouchWhenCoarse:!0,lockOrientation:`landscape`}},Wl={lock:`landscape`,enter:.95,leave:1.05,title:`TELEFONU YAN ÇEVİR`,body:`NEON RIDE yatay ekran için yapıldı.`},Gl={defaultMode:`tilt`,storageKey:`neon-ride.controls`,tilt:{range:22,deadZone:2.5,sensitivity:1,sensitivitySteps:[.6,.8,1,1.3,1.7],tau:.09,timeout:2,invert:!0},touch:{steerHalf:.5,dragRange:.2,brake:{x:.74,y:.3,width:.22,height:.26}},halves:{throttle:`right`,brake:`left`},floorByMode:{tilt:0,touch:0},hints:{enabled:!0,fadeAfter:12}},Kl={enabled:!1,withCapture:!0,reveal:{sequence:[`KeyG`,`KeyO`,`KeyD`],window:1.2},line:{lookAhead:150,gain:.55,reach:.72},traffic:{horizon:3,alongside:12,safety:.25,thread:.35,threadWeight:4,lineWeight:1,effortWeight:.55,switchMargin:2.2,reachSafety:.75,escapeReach:1.2,candidates:41},guard:{enabled:!0,floor:.05,lead:3,easeRate:40},hands:{steerGain:.55,steerTau:.16,driftAmount:.22,driftSpeed:.08,steadyWithin:1.6,steadyBefore:2,jitterAmount:.035,jitterSpeed:1.7},throttle:{brakeForce:1,brakeHold:.35,crowdedAt:.6,speedFloor:.62}},ql={seed:1337,dome:{radius:1500,widthSegments:64,heightSegments:32,colorBase:131336,colorMid:328464,colorTop:919588,midPoint:.55,glow:{color:4856458,azimuth:2.15,elevation:.5,intensity:.7,falloff:6}},stars:{textureSize:64,texture:{coreStop:.08,coreAlpha:.95,midStop:.22,midAlpha:.5,tailStop:.5,tailAlpha:.08},palette:[{color:16777215,weight:5},{color:16761962,weight:3},{color:9425151,weight:3}],twinkleAmount:.3,twinkleSpeed:1.6,trailBrightness:1.3,layers:[{name:`deep`,count:24e3,radius:1400,sizeMin:1.6,sizeMax:9,sizeExponent:4.5,brightness:.9,opacity:1,rotationSpeed:.0022,tilt:{x:0,z:0},galacticFraction:.85},{name:`mid`,count:9e3,radius:1320,sizeMin:2.2,sizeMax:13,sizeExponent:4,brightness:1,opacity:1,rotationSpeed:.0045,tilt:{x:.1,z:.2},galacticFraction:0},{name:`near`,count:3e3,radius:1240,sizeMin:3.5,sizeMax:20,sizeExponent:3,brightness:1.15,opacity:1,rotationSpeed:.0075,tilt:{x:-.15,z:.05},galacticFraction:0}],trails:{pole:{azimuth:2.45,elevation:.62},curves:12,polarMin:.3,polarMax:2.5,polarJitter:.045,tiltJitter:.05,jitter:.011,wobbleAmount:.032,wobbleScale:2.2,densityScale:2.6,densityContrast:1.6,densityFloor:.45,weightFalloff:.9,attempts:6}},nebula:{textureSize:256,textureVariants:3,noiseScale:2.6,fbm:{octaves:5,lacunarity:2.15,gain:.55},contrastLow:.34,contrastHigh:.86,falloffPower:1.35,clouds:[{azimuth:2.15,elevation:.62,distance:1150,scale:900,color:16723311,opacity:.45,rotation:.4,breathSpeed:.06,breathAmount:.22,variant:0},{azimuth:1.55,elevation:.5,distance:1150,scale:760,color:16731088,opacity:.36,rotation:-.7,breathSpeed:.045,breathAmount:.25,variant:2},{azimuth:2.9,elevation:.75,distance:1150,scale:820,color:14171135,opacity:.3,rotation:1.1,breathSpeed:.07,breathAmount:.2,variant:1},{azimuth:-1.25,elevation:.52,distance:1150,scale:620,color:4156415,opacity:.42,rotation:.15,breathSpeed:.035,breathAmount:.3,variant:1},{azimuth:-2.6,elevation:.62,distance:1150,scale:660,color:10304752,opacity:.38,rotation:-1.3,breathSpeed:.055,breathAmount:.24,variant:0}]},aurora:{radius:1120,height:1e3,baseY:-90,radialSegments:192,colorLow:3538843,colorHigh:10108415,warmColor:16742959,intensity:.95,warmIntensity:.18,warmHeight:.12,curtainHeight:.5,curtainVariation:.12,fadeBottom:.04,waveScale:2.3,waveSpeed:.04,rayScale:26,rayContrast:2,rayHeight:.5,warpScale:1.9,warpAmount:.55,clusterScale:4.5,clusterFloor:.28,clusterRange:.22,arcCenter:-1.6,arcHalfWidth:.7,arcSoftness:.6,arcDrift:.006,warmArcScale:1.25,warmFloor:.15}},Jl={gate:{ahead:900,behind:120,fadeStart:780,fadeEnd:520,height:11.5,legWidth:.9,beamHeight:.85,overhang:3,haloSpread:2.2,haloOpacity:.34,structureColor:2765640,neonColor:16777215,legStripWidth:.42,legStripOpacity:.85,blendSeconds:3.2,everyMeters:2600},traffic:{enabled:!0,seed:90210,mix:null,look:null,spawnAhead:900,spawnJitter:260,recycleBehind:140,spawnClear:30,minGap:26,laneDiscipline:1.15,bodyPalette:[1781598,6167332,3817290,7040888,1981490,4864542,8028040],types:[{name:`sedan`,count:22,size:{length:4.7,width:2.1,height:.82},cabin:{length:2.2,width:1.7,height:.52,offset:.1,taper:.76},speed:{min:.4,max:.78},stripColor:3007487},{name:`van`,count:10,size:{length:5.2,width:2.15,height:2.55},cabin:{length:1.5,width:2,height:.12,offset:-1.6,taper:.96},speed:{min:.3,max:.52},stripColor:16747039},{name:`ambulance`,count:5,size:{length:5.9,width:2.25,height:1.55},cabin:{length:1.7,width:2.05,height:.5,offset:-2,taper:.86},rearBox:{length:3.6,width:2.2,height:1.35,offset:1},bodyColor:13159636,speed:{min:.5,max:.66},stripColor:16722492,beacon:{colorA:16722492,colorB:3828735,size:[.5,.2,.5],spacing:.66,z:-1.9,rate:2.6}},{name:`jeep`,count:14,size:{length:4.3,width:1.78,height:1.72},cabin:{length:2.5,width:1.7,height:.78,offset:0,taper:.97},rideHeight:.38,speed:{min:.36,max:.7},stripColor:3800968},{name:`boxTruck`,count:8,size:{length:8.6,width:2.5,height:2.45},cabin:{length:2.3,width:2.35,height:.42,offset:-3,taper:.92},rearBox:{length:6,width:2.5,height:1.5,offset:1.1},speed:{min:.26,max:.44},minLane:1,rideHeight:.52,outlineGain:0,rearGlow:.12,stripColor:16757802,markers:{count:5,spacing:.52,size:[.16,.12,.16],side:{count:5,size:[.06,.11,.3],out:.02,drop:.62,margin:.5}},truck:{wheels:{radius:.52,width:.34,sides:8,inset:.16,color:657933,axles:[-2.6,2.1,3.1]},bumper:{widthScale:.92,height:.16,depth:.16,y:.46,color:1315866},mudFlaps:{width:.46,height:.5,gap:.22,color:855313},doors:{seam:.06,depth:.04,reach:.86,hinges:3,hingeInset:.16,hingeWidth:.3,color:1052694},plate:{width:.62,height:.2,x:0,y:-.55,color:14673646}}},{name:`semi`,count:6,size:{length:16,width:2.55,height:3.3},cabin:{length:2.6,width:2.45,height:.62,offset:-6.4,taper:.9},speed:{min:.3,max:.5},minLane:2,rideHeight:.58,outlineGain:0,rearGlow:.1,stripColor:16738847,markers:{count:7,spacing:.4,size:[.16,.12,.16],side:{count:8,size:[.06,.11,.3],out:.02,drop:.7,margin:.6}},truck:{wheels:{radius:.56,width:.34,sides:8,inset:.16,color:657933,axles:[-6.2,4.8,6,7]},bumper:{widthScale:.92,height:.16,depth:.16,y:.5,color:1315866},mudFlaps:{width:.46,height:.56,gap:.22,color:855313},doors:{seam:.06,depth:.04,reach:.86,hinges:3,hingeInset:.16,hingeWidth:.3,color:1052694},plate:{width:.62,height:.2,x:0,y:-1.05,color:14673646}}},{name:`motorcycle`,count:14,size:{length:2,width:.5,height:1.15},cabin:{length:.7,width:.42,height:.42,offset:-.25,taper:.7},speed:{min:.55,max:.86},stripColor:16725704,singleTail:!0,weave:{amount:.85,period:4.5}}],vehicle:{bodyColor:16777215,scaleJitter:.08,strip:{height:.15,inset:.02,y:-.08,lengthScale:.86},tail:{color:16722492,width:.5,height:.19,spacing:.58,y:.06,bar:{width:1.5,height:.2,y:-.14}},rear:{outline:{thickness:.14,inset:.05,depth:.05},glow:{widthScale:1.5,heightScale:1.55,offset:.3,opacity:.85}},glow:{size:5,y:.06,groundLevel:.18,nearFade:14,textureSize:128}},models:{god:{density:{start:.72,fullAt:9e3,curve:1.2,max:1},gap:{base:26,reaction:0},speedSpread:1,weaveScale:1,escape:{enabled:!1}},player:{density:{start:.16,fullAt:16e3,curve:.85,max:.5},gap:{base:30,reaction:.55},speedSpread:.55,weaveScale:.4,escape:{enabled:!0,window:58,maxAbreast:2,trucksAbreast:1,attempts:10,push:80}}},density:{start:.72,fullAt:9e3,curve:1.2},collision:{mode:`arcade`,playerHalfWidth:.5,playerHalfLength:1.2,speedLoss:.45,knockLateral:2},nearMiss:{range:.28,cooldown:1.5}},road:{chunkLength:200,poolSize:8,chunksBehind:1,lengthSegments:48,widthSegments:12,pointsPerChunk:4,carriageway:{lanes:4,laneWidth:3.8,shoulderRight:2.6,medianGap:1.2,medianWidth:3.2,oncomingLanes:4,verge:3},path:{lateralAmplitude:70,lateralWavelength:1100,lateralStraightBias:.62,elevationAmplitude:6,elevationWavelength:1500,fbm:{octaves:2,lacunarity:2,gain:.28}},surface:{asphaltColor:328969,voidColor:328464,medianColor:657428,oncomingDim:.55,groundColor:328464,bankColor:0,bankWidth:2.4,sheenColor:2757968,sheenStrength:.55,sheenPower:3,neonFadeStart:800,neonFadeEnd:1100},edges:{leftColor:2291711,rightColor:16722896,width:.3,glow:7,intensity:1.15,halo:.28},markings:{color:12174543,laneWidth:.16,edgeWidth:.2,dash:6,gap:9,intensity:.5,oncomingScale:.55},strips:{patternLength:240,wrapCycles:256,scrollFromSpeed:-.45,softness:.14,glow:5,halo:.35,lanes:[{anchor:`shoulder`,inset:-1.2,width:.5,color:16725704,repeats:6,duty:.38,speed:0,intensity:.9},{anchor:`medianInner`,inset:-.4,width:.45,color:3007487,repeats:4,duty:.34,speed:0,intensity:.85},{anchor:`medianOuter`,inset:.4,width:.45,color:3800968,repeats:5,duty:.3,speed:0,intensity:.7},{anchor:`farVerge`,inset:1.2,width:.5,color:16747039,repeats:3,duty:.42,speed:0,intensity:.6}]}},seed:20260914,fog:{color:328464,density:.0013},median:{enabled:!0,segmentsPerChunk:50,overlap:.35,width:.62,height:.95,color:1710628,capWidth:.7,capHeight:.07,capColor:9065488},oncoming:{enabled:!0,seed:5150,count:26,spawnAhead:1e3,spawnJitter:240,recycleBehind:120,scaleJitter:.1,speed:{min:.42,max:.72},body:{width:2,height:1.35,length:4.6,color:657938},lamp:{color:16777215,size:3.4,spacing:1.5,y:.75,opacity:1,textureSize:64}},scenery:{seed:424242,density:{pine:0,rock:0,lampLeft:0,lampRight:0,gantry:0},kinds:{pine:{shape:`pine`,perChunk:26,side:`both`,setback:1,spread:15,scaleMin:.9,scaleMax:2.1,sink:-.3,sides:8,trunkRadius:.22,trunkHeight:1,height:8.2,radius:2.1,tiers:4,taper:.52,spire:.35,overlap:.62,snowLine:.5,trunkColor:1709072,needleColor:1190434,snowColor:13624560},rock:{shape:`rock`,perChunk:18,side:`both`,setback:1.2,spread:18,scaleMin:.6,scaleMax:2.2,radius:1.1,squash:.7,color:1316380},gantry:{shape:`gantry`,perChunk:2,side:`centre`,setback:0,spread:0,scaleMin:1,scaleMax:1,span:21,height:7.4,legWidth:.34,footHeight:.5,beamHeight:.55,beamDepth:.4,legColor:2765373,toneMapped:!0,glow:{opacity:1,panel:{size:2.7,gap:.45,color:16777215,cells:[[1,0],[0,0],[0,1]]},sign:{textureSize:512,plateColor:`#0b1622`,borderColor:`#6fe8ff`,textColor:`#d8f6ff`}}},lampRight:{shape:`lampRight`,perChunk:7,side:`right`,setback:.5,spread:.4,scaleMin:1,scaleMax:1,height:9.5,postWidth:.32,armLength:3.4,headLength:1.5,headHeight:.28,headWidth:.6,postColor:2568252,headColor:10478335,toneMapped:!1,glow:{color:8377599,opacity:.85,size:9,stretch:2.2,lift:.06,haloSize:3.2,textureSize:128,texture:{coreStop:.06,coreAlpha:.9,midStop:.3,midAlpha:.32,tailStop:.62,tailAlpha:.06}}},lampLeft:{shape:`lampLeft`,perChunk:7,side:`left`,setback:.5,spread:.4,scaleMin:1,scaleMax:1,height:9.5,postWidth:.32,armLength:3.4,headLength:1.5,headHeight:.28,headWidth:.6,postColor:2568252,headColor:10478335,toneMapped:!1,glow:{color:8377599,opacity:.85,size:9,stretch:2.2,lift:.06,haloSize:3.2,textureSize:128,texture:{coreStop:.06,coreAlpha:.9,midStop:.3,midAlpha:.32,tailStop:.62,tailAlpha:.06}}}}},weather:{seed:777,kind:null,count:2600,box:[90,44,130],kinds:{snow:{color:16777215,opacity:.85,size:.13,fall:2.4,drift:[1.4,1],streakFrom:90,streakRate:.022,streakMax:3},rain:{color:12376319,opacity:.6,size:.09,fall:22,drift:[1.6,.6],streakFrom:0,streakRate:.06,streakMax:9},dust:{color:13208138,opacity:.4,size:.22,fall:.4,drift:[7,3],streakFrom:40,streakRate:.03,streakMax:5}}},roadside:{stationsPerChunk:10,verge:2.2,postWidth:.24,postDepth:.24,postHeight:6.4,postColor:2304822,baseWidth:.72,baseHeight:.42,tubeWidth:.1,tubeDepth:.1,tubeHeight:5,tubeLift:.55,tubeInset:.17,leftColor:2291711,rightColor:16722896},mountains:{enabled:!0,slabLength:2400,slabsPerLayer:2,columns:28,baseY:-70,depthJitter:80,ridge:{wavelength:520,octaves:3,lacunarity:2.1,gain:.5},layers:[{distance:420,height:120,floor:.3,color:657174},{distance:620,height:210,floor:.35,color:460050}]}},Yl={enabled:!1,pixelRatio:1,hideOverlay:!0,drift:{enabled:!0,amount:.12,period:19}},Xl={profiles:[{name:`wide`,aspect:1.7778,fov:75,fovMax:104,pitch:-.0994,riderOrigin:{x:0,y:-.2245,z:-.385},handScale:1,handInset:0,cameras:{ride:{height:0,pitch:0,rider:{x:0,y:0,z:0}},cinematic:{height:.46,pitch:-.26,rider:{x:0,y:.07,z:-.3}}}}]},Zl={sprite:{url:{glove:`sprites/glove-right.png`,gloveBrake:`sprites/glove-right-brake.png`},width:.4667,offset:[.0932,-.1155,0],followSteer:.45,brake:{on:.3,off:.16},renderOrder:10}},Ql={offset:[0,.112,-.075],rotation:[-.95,0,0],size:[.2,.112,.008],frameMargin:.007,frameDepth:.012,texture:{width:512,height:288},updateHz:20,labels:{speed:`HIZ`,unit:`KM/S`,rpm:`DEVIR x1000`,neutral:`N`},tach:{centre:[256,214],radius:118,width:22,sweep:[.86,2.14],maxRpm:16,redlineAt:13,shiftAt:.9,fillSlices:48,steps:160},gear:{y:180,size:84},speed:{y:250,size:34,split:4},shift:{y:12,width:168,height:16},lamps:[{kind:`neutral`,at:[62,22]},{kind:`beam`,at:[118,22]},{kind:`oil`,at:[394,22]},{kind:`temp`,at:[450,22]}],colors:{background:`#05030c`,border:`#2de3ff`,speed:`#dde6ff`,gear:`#c6d2f0`,label:`#7a7fa8`,tick:`#8e96c4`,rpmLow:`#2de3ff`,rpmMid:`#39ff88`,rpmHigh:`#ff2bd0`,rpmOff:`#141a2e`,redline:`#39091d`,neutral:`#39ff88`,beam:`#4aa8ff`,shiftOn:`#ff2bd0`,shiftOff:`#141a2e`,lampOff:`#242a44`}},$l=[[.1,1,1],[.86,.62,1],[1,-.04,0],[.82,-.66,1],[.06,-1,1],[-.72,-.74,0],[-.94,0,0],[-.5,.78,1]],eu=[[0,1,0],[.62,.8,1],[1,.1,0],[.74,-.7,1],[0,-1,0],[-.74,-.7,1],[-1,.1,0],[-.62,.8,1]],tu=[[0,1,1],[.55,.88,1],[.95,.3,1],[.8,-.55,1],[0,-.95,0],[-.8,-.55,1],[-.95,.3,1],[-.55,.88,1]],nu={color:6165021,ambient:1903118,key:16751238,keyStrength:1.05,rim:16738890,rimStrength:.22,rimPower:3.6},ru={wing:{section:$l,radii:[.167,.067,.21],offset:[.158,-.009,-.19],rotation:[.12,-.34,-.16],stations:[{z:1,offset:[-.08,-.06],scale:[.4,.44],roll:.14},{z:.46,offset:[-.02,-.02],scale:[.9,.92],roll:.06},{z:.02,offset:[.02,.01],scale:[1,1],roll:-.02},{z:-.5,offset:[.03,.03],scale:[.88,.86],roll:-.09},{z:-1,offset:[0,.02],scale:[.5,.56],roll:-.15}],vents:[{edgeFrom:7,edgeTo:8,stationFrom:1,stationTo:2,depth:.017}],trim:{crease:0,radius:.0062,radialSegments:6}},nose:{section:eu,radii:[.109,.05,.196],offset:[0,-.026,-.172],rotation:[.28,0,0],stations:[{z:1,offset:[0,-.02],scale:[.72,.8],roll:0},{z:.3,offset:[0,0],scale:[1,1],roll:0},{z:-.4,offset:[0,.02],scale:[.86,.8],roll:0},{z:-1,offset:[0,0],scale:[.5,.46],roll:0}]}},iu={radii:[.153,.086,.015],offset:[0,.208,-.315],rotation:[-.62,0,0],segments:[22,12],edge:{tube:.0045,segments:[36,6]}},au=[0,-.478,-.452],ou={supersport:{tank:{visible:!0,offset:[0,-.03,-.03],rotation:[.2,0,0],section:tu,radii:[.25,.07,.245],stations:[{z:1,offset:[0,-.02],scale:[.72,.7]},{z:.45,offset:[0,0],scale:[1,1]},{z:-.2,offset:[0,.01],scale:[.95,.92]},{z:-.7,offset:[0,0],scale:[.74,.7]},{z:-1,offset:[0,-.02],scale:[.48,.46]}],cap:{radius:.03,height:.012,offset:[0,.072,.095],segments:18},seam:{size:[.009,.005,.33],offset:[0,.032,.02]}},tripleClamp:{size:[.15,.034,.068],offset:[0,.045,-.012]},lowerFront:!0,forkTop:{from:[.0812,.075,.0142],to:[.097,-.215,-.092],radius:.019,radialSegments:14},lower:{axle:au,fork:{stanchion:{from:[.086,-.078,-.018],to:[.099,-.222,-.096],radius:.019,radialSegments:14},slider:{from:[.099,-.21,-.09],to:[.11,-.452,-.218],radius:.026,radialSegments:14},seal:{offset:[.099,-.212,-.091],radius:.0295,length:.014,segments:16},lug:{from:[.11,-.45,-.216],to:[.106,-.478,-.252],radius:.023,endRadius:.019,radialSegments:12},axleStub:{radius:.011,from:.092,to:.124,segments:12}},fender:{centre:au,radius:.212,thetaStart:.78,thetaLength:1.94,segments:20,thickness:.017,section:[[-.078,-.03,1],[-.07,.002,1],[-.04,.014,0],[0,.021,1],[.04,.014,0],[.07,.002,1],[.078,-.03,1]],seam:{width:.01,lift:.0045},stay:{from:[.104,-.404,-.196],to:[.082,-.404,-.322],radius:.006,radialSegments:8}},wheel:{centre:au,segments:28,tyre:[[.148,.048],[.172,.043],[.186,.03],[.191,0],[.186,-.03],[.172,-.043],[.148,-.048]],rim:[[.128,.044],[.146,.046],[.146,.038],[.128,.034],[.128,-.034],[.146,-.038],[.146,-.046],[.128,-.044]],hub:{radius:.036,halfWidth:.046,segments:16},spokes:{count:5,innerRadius:.034,outerRadius:.13,innerWidth:.034,outerWidth:.02,thickness:.016},disc:{x:.052,outerRadius:.094,innerRadius:.044,halfThickness:.002,segments:24},caliper:{offset:[.056,-.418,-.342],size:[.026,.064,.046],rotation:[-.5,0,0]},glow:{radius:.12,width:.005,halfWidth:.011,segments:28}}},headlight:{offset:[0,-.2,-.185],rotation:[.28,0,0],profile:[[.084,-.03],[.082,-.012],[.074,.01],[.056,.032],[.03,.048],[0,.055]],segments:20,rimRadius:.087,rimDepth:-.03,rimWidth:.012,rimSegments:20},cowl:{offset:[0,-.19,-.16],rotation:[.28,0,0],profile:[[.125,-.035],[.122,0],[.108,.04],[.082,.072],[.05,.092]],segments:22,lip:{radius:.127,width:.014,depth:-.035,segments:22}},paint:nu,fairing:ru,screen:iu,controls:{clipOn:{from:[.088,.0664,.02],to:[.19,.0806,.0517],radius:.0135,radialSegments:12},barEnd:{radius:.019,length:.022,offset:[.408,-.0345,.0905]}}}},su=`supersport`,$={renderer:Il,camera:Ll,loop:Rl,stats:zl,input:Bl,quality:Vl,touch:Hl,viewport:Ul,orientation:Wl,controls:Gl,capture:Yl,autopilot:Kl,framing:Xl,sky:ql,world:Jl,player:{bike:{startDistance:200,maxSpeed:235,startSpeed:120,acceleration:52,brakeForce:96,dragQuadratic:73e-5,dragLinear:.05,throttleFloor:.42,gearbox:{count:6,topSpeed:1.06,step:.78,bottomRpm:.24},lateralLimit:6.6,lateralSpeed:13,lateralReturnTau:.5,lateralTau:.35,leanMax:.14,leanFromSteer:.115,leanFromCurve:1.35,leanTau:.24,curveTau:.3},camera:{height:2.35,lookAhead:22,fovTau:.55,profile:`ride`,bob:{frequency:2.05,vertical:.032,lateral:.016,roll:.0075,floor:.22},shake:{amount:.03,exponent:2,frequency:11,roll:.006}},rider:{anchors:{rightGrip:{from:[.2163,.0895,.0717],to:[.3927,.0895,.0717],radius:.0187,along:.4587,offset:[0,0,0],rotation:[0,0,0],scale:1}},origin:{x:0,y:-.202,z:-.6},hardwareScale:.92,fovCompensation:0,bobLag:.3,steering:{pivot:{x:0,y:-.16,z:-.16},rake:.44,maxAngle:.19,tau:.09},bar:{radius:.0155,radialSegments:10,path:[[0,.0755,.015],[.09,.0805,.031],[.16,.0865,.054],[.2163,.0895,.0717]],clamp:{width:.115,height:.048,depth:.062,y:.0755},clampCap:{radius:.021,length:.05,spacing:.038}},mirror:{stalkFrom:[.126,.15,-.246],stalkTo:[.201,.166,-.3],stalkRadius:.011,stalkTipRadius:.008,headRadius:.03,headDepth:.008,headSegments:16,headRotation:{x:-.3,y:-.62,z:0},glassInset:.0018,glassRadius:.025},hand:Zl,machine:ou[su],machines:ou,bike:su,instruments:Ql,materials:{keyDirection:{x:-.35,y:.72,z:.6},frame:{color:1316383,ambient:1712184,key:10135240,keyStrength:.85,rim:4905471,rimStrength:.5,rimPower:2.6},dark:{color:789778,ambient:1448492,key:7304592,keyStrength:.55,rim:3007487,rimStrength:.22,rimPower:3.6},glove:{color:1843503,ambient:2304581,key:10068932,keyStrength:1.25,rim:10771711,rimStrength:.26,rimPower:4},mirror:{color:659230,ambient:1186352,key:12175080,keyStrength:1.15,rim:10120447,rimStrength:.9,rimPower:1.5,opacity:.3},vent:{color:658192,ambient:1317420,key:6055040,keyStrength:.45,rim:3007487,rimStrength:.2,rimPower:3.4},rubber:{color:526605,ambient:1053471,key:5922934,keyStrength:.42,rim:3007487,rimStrength:.12,rimPower:4.5},neonLeft:2291711,neonRight:16722896}},cockpit:{source:`sprite`,distance:.35,heightScale:.7034,offset:[0,-.1521],sway:{pivotDrop:.35,leanRoll:.3,steerRoll:.032,steerShift:.03,tau:.12},renderOrder:2e3,url:`sprites/cockpit.png`,maskUrl:`sprites/cockpit-mask.png`,screen:[.4697,.5703,.531,.6322]}},postprocess:{enabled:!0,exposure:.68,saturation:1.12,bloom:{strength:.45,radius:.3,threshold:.8,resolutionScale:.5,speedGain:.15},vignette:{strength:.34,start:.45},aberration:{amount:.0015,speedGain:.003,power:2.6},streaks:{strength:.32,length:.12,start:.45,exponent:2.2,taps:6}},flash:{enabled:!0,gain:1,sources:{collision:{color:16726570,strength:.5,edge:.55,duration:.35,refractory:1.2,priority:3,requiresRun:!0,blockedWhileInvulnerable:!0},nearMiss:{color:10148095,strength:.38,edge:1,duration:.4,refractory:0,priority:1,requiresRun:!0,blockedWhileInvulnerable:!0,aberrationBoost:.004},checkpoint:{color:8257476,strength:.3,edge:.7,duration:.3,refractory:0,priority:2,requiresRun:!0,blockedWhileInvulnerable:!1},themeGate:{color:16777215,strength:.42,edge:.25,duration:.55,refractory:0,priority:4,requiresRun:!1,blockedWhileInvulnerable:!1}}},ui:{start:{title:`NEON RIDE`,promptKey:`BAŞLAMAK İÇİN BİR TUŞA BAS`,promptTouch:`BAŞLAMAK İÇİN DOKUN`,fadeMs:420},comfort:{label:`AZALTILMIŞ HAREKET`,on:`●`,off:`○`},controls:{modeTilt:`KONTROL: EĞİM`,modeTouch:`KONTROL: DOKUNMATİK`,bannerTilt:`KONTROL: EĞİM`,bannerTouch:`KONTROL: DOKUNMATİK`,bannerSeconds:3,sensitivity:`HASSASİYET: `,soundOn:`SES: AÇIK`,soundOff:`SES: KAPALI`,recentre:`MERKEZİ SIFIRLA`,recentred:`SIFIRLANDI`,hintSteer:`YÖN`,hintThrottle:`GAZ`,hintBrake:`FREN`,tiltSilent:`Eğim sensörü veri göndermiyor. Dokunmatik kontrole geçildi.`,tiltEmpty:`Eğim sensörü boş veri gönderiyor. Dokunmatik kontrole geçildi.`,tiltMissing:`Bu cihazda eğim sensörü yok. Dokunmatik kontrole geçildi.`,tiltDenied:`Eğim izni verilmedi. Dokunmatik kontrole geçildi.`,tiltInsecure:`Eğim sensörü yalnızca HTTPS üzerinde çalışır. Dokunmatik kontrole geçildi.`},lives:{label:`CAN`,full:`●`,empty:`○`},hud:{distanceUnit:` M`,nearMiss:`KIL PAYI`},panel:{pausedTitle:`DURAKLATILDI`,resumeKey:`DEVAM ETMEK İÇİN ESC`,resumeTouch:`DEVAM ETMEK İÇİN DOKUN`,overTitle:`DÜŞTÜN`,best:`EN İYİ`,record:`YENİ REKOR`,restartKey:`TEKRAR DENEMEK İÇİN BİR TUŞA BAS`,restartTouch:`TEKRAR DENEMEK İÇİN DOKUN`},select:{back:`GERİ`,next:`İLERİ`,start:`BAŞLA`,quick:`HIZLI BAŞLA`,locked:`YAKINDA`,hintKeys:`SEÇMEK İÇİN OK TUŞLARI, ONAYLAMAK İÇİN ENTER`,hintTouch:`KAYDIR VEYA DOKUN`},bikes:{title:`MOTOR SEÇ`,speed:`HIZ`,acceleration:`HIZLANMA`,handling:`YÖN HAKİMİYETİ`,blurb:{volt:`DENGELİ. HER YOLDA GÜVENİLİR.`,nova:`ÇIKIŞTA HIZLI, ZİRVEDE DAHA YAVAŞ.`,ember:`EN YÜKSEK HIZ, EN AĞIR KALKIŞ.`,frost:`EN İYİ VİRAJ VE FREN, ORTA HIZ.`}},roads:{title:`YOL SEÇ`,name:{galaxyRoad:`GALAKSİ YOLU`,auroraPass:`KUZEY GEÇİDİ`},blurb:{galaxyRoad:`YILDIZLARIN ALTINDA BOŞ BİR OTOYOL.`,auroraPass:`KAR, DAĞLAR VE KUZEY IŞIKLARI.`},mixed:`TÜM YOLLAR`,mixedBlurb:`YOL, IŞIK KAPILARINDA DEĞİŞİR.`}},game:{pointsPerUnit:1,nearMissPoints:120,crashesAllowed:3,invulnerable:1.6,invulnerableBlink:9,storageKey:`neon-ride.best`,overDelay:.9,fadeMs:420},comfort:{reducedMotion:!1,media:`(prefers-reduced-motion: reduce)`,storageKey:`neon-ride.reduced-motion`,scale:{stripScroll:.12,bob:.25,shake:.1,fovRamp:.35,cockpitSway:.3,weather:.18,flash:.28}},bikes:{volt:{name:`VOLT`,paint:{body:2672895,rim:7336703,glass:3127528},bars:{speed:.62,acceleration:.6,handling:.6},patch:{player:{bike:{acceleration:52,brakeForce:96,dragQuadratic:773e-6,lateralSpeed:13,lateralTau:.35}}}},nova:{name:`NOVA`,paint:{body:16727208,rim:16746200,glass:13056668},bars:{speed:.42,acceleration:.92,handling:.6},patch:{player:{bike:{acceleration:59,brakeForce:94,dragQuadratic:.001012,lateralSpeed:13.2,lateralTau:.35}}}},ember:{name:`EMBER`,paint:{body:16749350,rim:16765286,glass:14187050},bars:{speed:.95,acceleration:.38,handling:.48},patch:{player:{bike:{acceleration:46,brakeForce:90,dragQuadratic:614e-6,lateralSpeed:12.4,lateralTau:.38}}}},frost:{name:`FROST`,paint:{body:14215413,rim:16777215,glass:10470104},bars:{speed:.52,acceleration:.55,handling:.95},patch:{player:{bike:{acceleration:50,brakeForce:108,dragQuadratic:773e-6,lateralSpeed:14.4,lateralTau:.29}}}}},bike:`volt`,paint:{enabled:!0,bodyStrength:.82,shadowChroma:2.3,rimStrength:1,glassGain:.35},bikeStorageKey:`neon-ride.bike`,theme:`galaxyRoad`,themes:{galaxyRoad:{name:`Galaxy Road`,world:{scenery:{density:{pine:0,rock:0,lampLeft:0,lampRight:0,gantry:0}},weather:{kind:null},mountains:{enabled:!1},road:{surface:{oncomingDim:.45}}},comfort:{centreMotion:`lane paint only, at road speed`,weather:`none`}},auroraPass:{name:`Aurora Pass`,world:{fog:{color:660512,density:.0012},road:{surface:{asphaltColor:395019,sheenColor:2781053,sheenStrength:.7,groundColor:4152688,bankColor:3163994,bankWidth:3.2,medianColor:4876926,oncomingDim:.7},edges:{leftColor:8319231,rightColor:5111720,intensity:1.2},markings:{color:13951722,intensity:.58},strips:{lanes:[{anchor:`shoulder`,inset:-1.2,width:.5,color:5111720,repeats:6,duty:.38,speed:0,intensity:.85},{anchor:`medianInner`,inset:-.4,width:.45,color:8319231,repeats:4,duty:.34,speed:0,intensity:.8},{anchor:`medianOuter`,inset:.4,width:.45,color:10321407,repeats:5,duty:.3,speed:0,intensity:.6},{anchor:`farVerge`,inset:1.2,width:.5,color:8319231,repeats:3,duty:.42,speed:0,intensity:.5}]}},median:{color:2900820,capColor:14412274,capWidth:.86,capHeight:.12},roadside:{leftColor:6086911,rightColor:5111720,stationsPerChunk:6},scenery:{density:{pine:1,rock:.5,lampLeft:.8,lampRight:.8,gantry:.5}},weather:{kind:`snow`},mountains:{layers:[{distance:700,height:235,floor:.3,color:1450799},{distance:1e3,height:370,floor:.35,color:1056040}]}},sky:{dome:{colorBase:331802,colorMid:660512,colorTop:727854,glow:{color:1931882,azimuth:-1.6,elevation:.35,intensity:.28,falloff:6}},stars:{twinkleAmount:.42,trailBrightness:1.5},nebula:{clouds:[{azimuth:-2.4,elevation:.72,distance:1150,scale:760,color:3107839,opacity:.3,rotation:.4,breathSpeed:.05,breathAmount:.22,variant:1},{azimuth:2.6,elevation:.66,distance:1150,scale:700,color:8016856,opacity:.24,rotation:-.8,breathSpeed:.04,breathAmount:.26,variant:0}]},aurora:{radius:1120,height:900,baseY:-60,colorLow:4063136,colorHigh:10775551,intensity:4.5,warmIntensity:0,curtainHeight:1.05,arcHalfWidth:1.15,rayScale:5,rayContrast:2.2,rayHeight:.45,clusterScale:3,clusterFloor:.22,clusterRange:.34,waveScale:1.7,waveSpeed:.022,arcDrift:.004}},comfort:{centreMotion:`lane paint at road speed, plus falling snow`,weather:`snow, scaled by motionScale(weather) - 0.18 of the fall when reduced motion is on`}}},plannedThemes:[{key:`sunsetHighway`,name:`GÜN BATIMI YOLU`},{key:`neonMetropolis`,name:`NEON ŞEHİR`},{key:`nebulaCoast`,name:`NEBULA KIYISI`},{key:`redPlanet`,name:`KIZIL GEZEGEN`}],themeStorageKey:`neon-ride.theme`,MIXED:`mixed`,audio:{storageKey:`neon-ride.muted`,enabled:!0,master:{gain:.85,limiter:{threshold:-3,knee:0,ratio:20,attack:.003,release:.25},tau:.02,startFade:.6,pausedGain:.25},engine:{gain:.34,gainFloor:.18,gainExponent:1.7,trim:.2,idleRpm:1300,redlineRpm:14e3,firingsPerRev:2,partials:[1,.82,.52,.46,.3,.24,.205,.175,.14,.115,.095,.078,.064,.052,.043,.035],detuneCents:11,detuneGain:.55,formants:[{frequency:190,q:1.1,gain:7},{frequency:620,q:1.5,gain:5},{frequency:1750,q:2.1,gain:6.5},{frequency:3250,q:3,gain:3}],drive:{idle:1,full:6.5,fromThrottle:.55,curveSteps:1024},tone:{closed:900,open:7200,fromRpm:3600,q:.7},intake:{low:380,high:2100,q:.9,gain:.5,fromThrottle:.7},shift:{glide:.03,duckMs:90,duck:.45},overrun:{below:.25,gain:.55}},wind:{gain:.2,low:260,high:1150,q:.55,exponent:2,floor:.06},traffic:{gain:.26,voices:6,range:90,doppler:{strength:.55,maxShift:1.9},pass:{low:220,high:900,q:1.2},siren:{gain:.45,toneA:650,toneB:870,glide:.18,partials:[1,.3,.14,.06],range:240}}}},cu=class{constructor(e=document.body){this.el=document.createElement(`div`),this.el.className=`error-panel`,this.el.hidden=!0,e.appendChild(this.el),this._first=null,this._count=0,this._onError=e=>{let t=e.error||e.reason,n=t&&t.stack?t.stack:String(t&&t.message||e.message||t||`unknown error`);this.show(n)},window.addEventListener(`error`,this._onError),window.addEventListener(`unhandledrejection`,this._onError)}show(e){this._count++,this._first===null&&(this._first=e),this.el.textContent=this._first+(this._count>1?`\n\n(x${this._count})`:``),this.el.hidden=!1}dispose(){window.removeEventListener(`error`,this._onError),window.removeEventListener(`unhandledrejection`,this._onError),this.el.remove()}},lu=class e{constructor(){let t=e.hasCoarsePointer(),n=Math.min(window.innerWidth,window.innerHeight);this.coarsePointer=t,this.phone=t&&n<$.quality.auto.phoneShortEdge,this.preset=e.resolvePreset(this.phone,t),this.apply()}static hasCoarsePointer(){return window.matchMedia&&window.matchMedia(`(pointer: coarse)`).matches?!0:navigator.maxTouchPoints>0&&!window.matchMedia(`(pointer: fine)`).matches}static resolvePreset(e,t){let n=$.quality.preset;if(n!==`auto`)return $.quality.presets[n]?n:`high`;if(!t)return`high`;let r=$.quality.auto,i=navigator.deviceMemory,a=navigator.hardwareConcurrency,o=typeof i==`number`&&i<=r.lowMemory||typeof a==`number`&&a<=r.lowCores;return e?o?`low`:`medium`:o?`medium`:`high`}apply(){let e=$.quality.presets[this.preset];if(!e)return;if(!this._base){let e=$.world.traffic.models.god.density;this._base={trafficStart:e.start,trafficFullAt:e.fullAt,playerStart:$.world.traffic.models.player.density.start,playerMax:$.world.traffic.models.player.density.max,oncomingCount:$.world.oncoming.count,starCounts:$.sky.stars.layers.map(e=>e.count)}}$.renderer.maxPixelRatio=e.maxPixelRatio,$.renderer.antialias=e.antialias,$.postprocess.enabled=e.postprocess,$.postprocess.bloom.resolutionScale=e.bloomScale;let t=$.world.traffic.models;t.god.density.start=this._base.trafficStart*e.trafficScale,t.god.density.fullAt=this._base.trafficFullAt/e.trafficScale,t.player.density.start=this._base.playerStart*e.trafficScale,t.player.density.max=this._base.playerMax*e.trafficScale,$.world.oncoming.count=Math.max(1,Math.round(this._base.oncomingCount*e.trafficScale));let n=$.sky.stars.layers;for(let t=0;t<n.length;t++)n[t].count=Math.round(this._base.starCounts[t]*e.starScale)}describe(){return this.preset+(this.phone?` (phone)`:this.coarsePointer?` (touch)`:``)}},uu=class{constructor(e=null){this.onChange=e,this._listeners=new Set;let t=pu();t===null?($.comfort.reducedMotion=fu(),this.fromSystem=$.comfort.reducedMotion):($.comfort.reducedMotion=t,this.fromSystem=!1)}get reduced(){return $.comfort.reducedMotion}set(e){let t=!!e;if(t===$.comfort.reducedMotion)return t;$.comfort.reducedMotion=t,mu(t);for(let e of this._listeners)e(t);return this.onChange&&this.onChange(t),t}toggle(){return this.set(!$.comfort.reducedMotion)}subscribe(e){return this._listeners.add(e),()=>this._listeners.delete(e)}dispose(){this._listeners.clear(),this.onChange=null}};function du(e){let t=$.comfort;return t.reducedMotion?t.scale[e]:1}function fu(){try{return window.matchMedia($.comfort.media).matches}catch{return!1}}function pu(){try{let e=window.localStorage.getItem($.comfort.storageKey);return e===null?null:e===`1`}catch{return null}}function mu(e){try{window.localStorage.setItem($.comfort.storageKey,e?`1`:`0`)}catch{}}function hu(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function gu(e,t){let n={};if(!hu(t))return n;for(let r of Object.keys(t)){let i=t[r],a=e[r];if(hu(i)&&hu(a)){n[r]=gu(a,i);continue}n[r]=a,e[r]=i}return n}var _u=class{constructor(e,t,n){this.target=e,this.library=t,this.name=null,this._undo=null,this.select(n)}get names(){return Object.keys(this.library)}select(e){return Object.prototype.hasOwnProperty.call(this.library,e)?e===this.name||(this._undo&&gu(this.target,this._undo),this._undo=gu(this.target,this.library[e]),this.name=e,!0):!1}cycle(){let e=this.names,t=e[(e.indexOf(this.name)+1)%e.length];return this.select(t),t}restore(){this._undo&&gu(this.target,this._undo),this._undo=null,this.name=null}},vu=class e{constructor(t=document.body){this.container=t,this.canvas=document.createElement(`canvas`),this.container.appendChild(this.canvas),this.scene=new Mn;let n=$.camera;this.camera=new Xa(n.fov,window.innerWidth/window.innerHeight,n.near,n.far),this.camera.position.set(n.position.x,n.position.y,n.position.z),this.camera.lookAt(n.lookAt.x,n.lookAt.y,n.lookAt.z),this.scene.add(this.camera);let r=$.renderer;this.renderer=new Fl({canvas:this.canvas,antialias:r.antialias,powerPreference:r.powerPreference}),this.renderer.setPixelRatio(e.pixelRatio()),this.renderer.setSize(window.innerWidth,window.innerHeight,!0),this.renderer.outputColorSpace=Le,this.renderer.toneMapping=0,this.renderer.setClearColor(r.clearColor,1),this.onResize=null}resize(t,n){this.camera.aspect=t/n,this.camera.updateProjectionMatrix(),this.renderer.setPixelRatio(e.pixelRatio()),this.renderer.setSize(t,n,!0),this.onResize&&this.onResize(t,n)}static pixelRatio(){return $.capture.enabled?$.capture.pixelRatio:Math.min(window.devicePixelRatio,$.renderer.maxPixelRatio)}render(){this.renderer.render(this.scene,this.camera)}static disposeObject(e){e.traverse(e=>{e.geometry&&e.geometry.dispose();let t=e.material;if(!t)return;let n=Array.isArray(t)?t:[t];for(let e of n){for(let t of Object.keys(e)){let n=e[t];n&&n.isTexture&&n.dispose()}e.dispose()}})}dispose(){this.onResize=null,e.disposeObject(this.scene),this.scene.clear(),this.renderer.dispose(),this.renderer.forceContextLoss(),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas),this.canvas=null,this.renderer=null}},yu=class{constructor(){this.aspect=1,this.fov=75,this.fovMax=90,this.pitch=0,this.riderOrigin={x:0,y:0,z:-1},this.handScale=1,this.handInset=0,this.camera={height:0,pitch:0,rider:{x:0,y:0,z:0}},this.name=``,this._resolved=[],this._probe=[],this.update(1)}refresh(e){if(!Number.isFinite(e)||e<=0)return this;if(this._read(e,this._probe),this._probe.length===this._resolved.length){let e=!0;for(let t=0;t<this._probe.length;t++)if(this._probe[t]!==this._resolved[t]){e=!1;break}if(e)return this}return this.update(e)}update(e){let t=$.framing.profiles;this.aspect=e;let n=t[0],r=t[t.length-1];for(let i=0;i<t.length-1;i++)if(e>=t[i].aspect&&e<=t[i+1].aspect){n=t[i],r=t[i+1];break}e<=t[0].aspect&&(r=t[0]),e>=t[t.length-1].aspect&&(n=t[t.length-1]);let i=r.aspect-n.aspect,a=i>0?(e-n.aspect)/i:0;this.fov=n.fov+(r.fov-n.fov)*a,this.fovMax=n.fovMax+(r.fovMax-n.fovMax)*a,this.pitch=n.pitch+(r.pitch-n.pitch)*a,this.handScale=n.handScale+(r.handScale-n.handScale)*a,this.handInset=n.handInset+(r.handInset-n.handInset)*a,this.riderOrigin.x=n.riderOrigin.x+(r.riderOrigin.x-n.riderOrigin.x)*a,this.riderOrigin.y=n.riderOrigin.y+(r.riderOrigin.y-n.riderOrigin.y)*a,this.riderOrigin.z=n.riderOrigin.z+(r.riderOrigin.z-n.riderOrigin.z)*a;let o=$.player.camera.profile,s=n.cameras[o]||n.cameras.ride,c=r.cameras[o]||r.cameras.ride;return this.camera.height=s.height+(c.height-s.height)*a,this.camera.pitch=s.pitch+(c.pitch-s.pitch)*a,this.camera.rider.x=s.rider.x+(c.rider.x-s.rider.x)*a,this.camera.rider.y=s.rider.y+(c.rider.y-s.rider.y)*a,this.camera.rider.z=s.rider.z+(c.rider.z-s.rider.z)*a,this.name=a<.5?n.name:r.name,this._read(e,this._resolved),this}_read(e,t){let n=$.framing.profiles,r=$.player.camera.profile;t.length=0,t.push(e);let i=Object.keys(n[0].cameras);t.push(i.indexOf(r));for(let e=0;e<n.length;e++){let i=n[e],a=i.cameras[r]||i.cameras.ride;t.push(i.aspect,i.fov,i.fovMax,i.pitch,i.riderOrigin.x,i.riderOrigin.y,i.riderOrigin.z,i.handScale,i.handInset,a.height,a.pitch,a.rider.x,a.rider.y,a.rider.z)}}},bu=class{constructor(e,t){this._byCode=new Map;for(let n of Object.keys(t))e[n]&&this._byCode.set(t[n],e[n]);this._onKeyDown=e=>{if(e.repeat)return;let t=this._byCode.get(e.code);t&&t()},window.addEventListener(`keydown`,this._onKeyDown)}dispose(){window.removeEventListener(`keydown`,this._onKeyDown),this._byCode.clear()}},xu=class{constructor(e,t,n){this.codes=e,this.window=t,this.action=n,this._index=0,this._last=0,this._onKeyDown=e=>{if(e.repeat||this.codes.length===0)return;let t=performance.now()/1e3;if(this._index>0&&t-this._last>this.window&&(this._index=0),e.code===this.codes[this._index]){this._index++,this._last=t,this._index>=this.codes.length&&(this._index=0,this.action());return}this._index=+(e.code===this.codes[0]),this._last=t},window.addEventListener(`keydown`,this._onKeyDown)}dispose(){window.removeEventListener(`keydown`,this._onKeyDown),this.action=null}},Su=class{constructor(e,{onRender:t=null,state:n={}}={}){this.renderer=e,this.onRender=t,this.running=!1,this.paused=!1,this._listeners=[],this._timer=new no,this._timer.connect(document),this._tick=this._tick.bind(this),this._frames=0,this._elapsedSinceSample=0,this.state=Object.assign(n,{dt:0,elapsed:0,frame:0,fps:0,frameMs:0,drawCalls:0,triangles:0,programs:0,geometries:0,textures:0})}add(e){return typeof e==`function`&&!this._listeners.includes(e)&&this._listeners.push(e),e}remove(e){let t=this._listeners.indexOf(e);t!==-1&&this._listeners.splice(t,1)}start(){this.running||(this.running=!0,this._timer.reset(),this.renderer.setAnimationLoop(this._tick))}stop(){this.running&&(this.running=!1,this.renderer.setAnimationLoop(null))}_tick(e){this._timer.update(e);let t=this._timer.getDelta(),n=this.paused?0:Math.min(t,$.loop.maxDelta),r=this.state;r.dt=n,r.elapsed+=n,r.frame++;let i=this._listeners.slice();for(let e=0;e<i.length;e++)i[e](n,r);this.onRender&&this.onRender(n,r),this._measure(t)}_measure(e){let t=this.renderer.info;this.state.drawCalls=t.render.calls,this.state.triangles=t.render.triangles,this.state.programs=t.programs?t.programs.length:0,this.state.geometries=t.memory.geometries,this.state.textures=t.memory.textures,this._frames++,this._elapsedSinceSample+=e;let n=$.stats.updateInterval;this._elapsedSinceSample>=n&&(this.state.fps=this._frames/this._elapsedSinceSample,this.state.frameMs=this._elapsedSinceSample*1e3/this._frames,this._frames=0,this._elapsedSinceSample=0)}dispose(){this.stop(),this._timer.dispose(),this._listeners.length=0,this.onRender=null,this.renderer=null}},Cu=class e{constructor(e=window){this.target=e,this.values={steer:0,throttle:0,brake:0},this.raw={steer:0,throttle:0,brake:0},this._keys=new Set,this._touchSteer=0,this._touchThrottle=0,this._touchBrake=0,this._gamepadIndex=null,this._steerTouch=null,this.controls=null,this.onFirstTouch=null,this._onKeyDown=this._onKeyDown.bind(this),this._onKeyUp=this._onKeyUp.bind(this),this._onBlur=this._onBlur.bind(this),this._onTouch=this._onTouch.bind(this),this._onGamepadConnected=this._onGamepadConnected.bind(this),this._onGamepadDisconnected=this._onGamepadDisconnected.bind(this),window.addEventListener(`keydown`,this._onKeyDown),window.addEventListener(`keyup`,this._onKeyUp),window.addEventListener(`blur`,this._onBlur),window.addEventListener(`gamepadconnected`,this._onGamepadConnected),window.addEventListener(`gamepaddisconnected`,this._onGamepadDisconnected);let t={passive:!1};this.target.addEventListener(`touchstart`,this._onTouch,t),this.target.addEventListener(`touchmove`,this._onTouch,t),this.target.addEventListener(`touchend`,this._onTouch,t),this.target.addEventListener(`touchcancel`,this._onTouch,t)}_onKeyDown(t){e.SCROLL_KEYS.has(t.code)&&t.preventDefault(),!t.repeat&&this._keys.add(t.code)}_onKeyUp(e){this._keys.delete(e.code)}_onBlur(){this._keys.clear(),this._touchSteer=0,this._touchThrottle=0,this._touchBrake=0}_onTouch(e){if(e.preventDefault(),this.onFirstTouch&&e.type===`touchstart`){let e=this.onFirstTouch;this.onFirstTouch=null,e()}let t=$.controls,n=e.touches,r=window.innerWidth,i=window.innerHeight,a=this.controls&&this.controls.mode===`tilt`,o=0,s=0;if(a){for(let e=0;e<n.length;e++)n[e].clientX>=r*.5==(t.halves.throttle===`right`)?o=1:s=1;this._steerTouch=null,this._touchSteer=0}else{let e=t.touch,a=r*e.steerHalf,c=e.brake,l=(e,t)=>e>=r*c.x&&e<=r*(c.x+c.width)&&t>=i*c.y&&t<=i*(c.y+c.height),u=null;for(let e=0;e<n.length;e++)if(this._steerTouch&&n[e].identifier===this._steerTouch.id){u=n[e];break}for(let e=0;e<n.length;e++){let t=n[e];if(u&&t.identifier===u.identifier)continue;let r=t.clientX,i=t.clientY;if(!u&&r<a){this._steerTouch={id:t.identifier,startX:r},u=t;continue}l(r,i)?s=1:r>=a&&(o=1)}if(u){let t=Math.max(1,r*e.dragRange),n=(u.clientX-this._steerTouch.startX)/t;this._touchSteer=Math.max(-1,Math.min(1,n))}else this._steerTouch=null,this._touchSteer=0}this._touchThrottle=o,this._touchBrake=s}_onGamepadConnected(e){this._gamepadIndex=e.gamepad.index}_onGamepadDisconnected(e){this._gamepadIndex===e.gamepad.index&&(this._gamepadIndex=null)}_readGamepad(){if(!navigator.getGamepads)return null;let t=navigator.getGamepads(),n=this._gamepadIndex===null?null:t[this._gamepadIndex];if(!n||!n.connected)return null;let r=$.input.gamepadDeadzone,i=$.input.gamepadTriggerThreshold,a=n.axes.length>0?n.axes[0]:0;a=Math.abs(a)<r?0:(a-Math.sign(a)*r)/(1-r),a===0&&(e.isPressed(n.buttons[14])?a=-1:e.isPressed(n.buttons[15])&&(a=1));let o=e.buttonValue(n.buttons[7]);o<i&&e.isPressed(n.buttons[0])&&(o=1);let s=e.buttonValue(n.buttons[6]);return{steer:e.clamp(a,-1,1),throttle:e.clamp(o,0,1),brake:e.clamp(s,0,1)}}update(t){let n=this._keys,r=0;(n.has(`KeyA`)||n.has(`ArrowLeft`))&&--r,(n.has(`KeyD`)||n.has(`ArrowRight`))&&(r+=1);let i=n.has(`KeyW`)||n.has(`ArrowUp`)?1:0,a=n.has(`KeyS`)||n.has(`ArrowDown`)||n.has(`Space`)?1:0;if(r===0){let e=this.controls?this.controls.update(t):0;r=this.controls&&this.controls.mode===`tilt`?e:this._touchSteer}i=Math.max(i,this._touchThrottle),a=Math.max(a,this._touchBrake);let o=this._readGamepad();o&&(Math.abs(o.steer)>Math.abs(r)&&(r=o.steer),i=Math.max(i,o.throttle),a=Math.max(a,o.brake)),this.raw.steer=e.clamp(r,-1,1),this.raw.throttle=e.clamp(i,0,1),this.raw.brake=e.clamp(a,0,1);let s=$.input;return this.values.steer=e.damp(this.values.steer,this.raw.steer,s.steerSmoothing,t),this.values.throttle=e.damp(this.values.throttle,this.raw.throttle,s.throttleSmoothing,t),this.values.brake=e.damp(this.values.brake,this.raw.brake,s.brakeSmoothing,t),this.values}dispose(){window.removeEventListener(`keydown`,this._onKeyDown),window.removeEventListener(`keyup`,this._onKeyUp),window.removeEventListener(`blur`,this._onBlur),window.removeEventListener(`gamepadconnected`,this._onGamepadConnected),window.removeEventListener(`gamepaddisconnected`,this._onGamepadDisconnected),this.target.removeEventListener(`touchstart`,this._onTouch),this.target.removeEventListener(`touchmove`,this._onTouch),this.target.removeEventListener(`touchend`,this._onTouch),this.target.removeEventListener(`touchcancel`,this._onTouch),this._keys.clear()}static damp(e,t,n,r){return n<=0?t:e+(t-e)*(1-Math.exp(-r/n))}static clamp(e,t,n){return e<t?t:e>n?n:e}static isPressed(e){return!!e&&e.pressed}static buttonValue(e){return e?e.pressed?Math.max(e.value,1):e.value:0}};Cu.SCROLL_KEYS=new Set([`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`Space`]);var wu=class{constructor(e){this.onChange=e,this.width=0,this.height=0,this._timer=0,this._pending=!1,this._onResize=this._schedule.bind(this),this._onOrientation=this._immediate.bind(this),window.addEventListener(`resize`,this._onResize),window.addEventListener(`orientationchange`,this._onOrientation),this._visual=$.viewport.useVisualViewport?window.visualViewport:null,this._visual&&this._visual.addEventListener(`resize`,this._onResize),this._apply(!0)}measure(){return this._visual?{width:Math.round(this._visual.width),height:Math.round(this._visual.height)}:{width:window.innerWidth,height:window.innerHeight}}get landscape(){return this.width>=this.height}_schedule(){this._pending=!0,this._timer=$.viewport.resizeDebounce}_immediate(){this._pending=!0,this._timer=0}update(e){this._pending&&(this._timer-=e,!(this._timer>0)&&(this._pending=!1,this._apply(!1)))}_apply(e){let t=this.measure();if(t.width<=0||t.height<=0)return;let n=$.viewport.minChange,r=Math.abs(t.width-this.width)>=n||Math.abs(t.height-this.height)>=n;(e||r)&&(this.width=t.width,this.height=t.height,this.onChange(this.width,this.height))}dispose(){window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`orientationchange`,this._onOrientation),this._visual&&this._visual.removeEventListener(`resize`,this._onResize),this.onChange=null}},Tu={supported(){return!!(document.documentElement.requestFullscreen||document.fullscreenElement!==void 0)&&typeof document.documentElement.requestFullscreen==`function`},active(){return!!document.fullscreenElement},request(){if(!Tu.supported()||Tu.active())return;let e=document.documentElement.requestFullscreen();e&&e.then&&e.then(()=>{let e=$.viewport.fullscreen.lockOrientation;if(e&&screen.orientation&&screen.orientation.lock)return screen.orientation.lock(e).catch(()=>{})}).catch(()=>{})},exit(){Tu.active()&&document.exitFullscreen&&document.exitFullscreen().catch(()=>{})},toggle(){Tu.active()?Tu.exit():Tu.request()}},Eu=class{constructor(e){this.el=document.createElement(`div`),this.el.className=`hints`,this.left=document.createElement(`div`),this.left.className=`hint hint-left`,this.right=document.createElement(`div`),this.right.className=`hint hint-right`,this.brake=document.createElement(`div`),this.brake.className=`hint hint-brake`,this.brake.textContent=$.ui.controls.hintBrake,this.el.append(this.left,this.right,this.brake),e.appendChild(this.el),this.noticeEl=document.createElement(`div`),this.noticeEl.className=`control-notice`,this.noticeEl.hidden=!0,e.appendChild(this.noticeEl),this._age=0,this._faded=!1,this._mode=null,this._visible=!0,this._noticeTimer=null,this.setMode($.controls.defaultMode)}setMode(e){if(e===this._mode)return;this._mode=e;let t=e===`tilt`;if(this.brake.hidden=t,!t){let e=$.controls.touch.brake;this.brake.style.left=`${e.x*100}%`,this.brake.style.top=`${e.y*100}%`,this.brake.style.width=`${e.width*100}%`,this.brake.style.height=`${e.height*100}%`}let n=$.ui.controls;this.left.textContent=t?n.hintBrake:n.hintSteer,this.right.textContent=n.hintThrottle,this.left.style.width=`${(t?.5:$.controls.touch.steerHalf)*100}%`,this.right.style.width=`${(1-(t?.5:$.controls.touch.steerHalf))*100}%`,this._age=0,this._faded=!1,this.el.classList.remove(`hints-faded`)}setVisible(e){this._visible=e,this.el.hidden=!e||!$.controls.hints.enabled}banner(e){let t=$.ui.controls;this.notice(e===`tilt`?t.bannerTilt:t.bannerTouch,t.bannerSeconds*1e3)}notice(e,t=5200){this.noticeEl.textContent=e,this.noticeEl.hidden=!1,clearTimeout(this._noticeTimer),this._noticeTimer=setTimeout(()=>{this.noticeEl.hidden=!0},t)}update(e){if(this._faded||!this._visible)return;let t=$.controls.hints.fadeAfter;t&&(this._age+=e,!(this._age<t)&&(this._faded=!0,this.el.classList.add(`hints-faded`)))}dispose(){clearTimeout(this._noticeTimer),this.el.remove(),this.noticeEl.remove()}},Du=class{constructor(e,t){this.el=document.createElement(`button`),this.el.type=`button`,this.el.className=`pause-button`,this.el.setAttribute(`aria-label`,`Duraklat`),this.el.innerHTML=`<span></span><span></span>`,this._onPress=e=>{e.preventDefault(),e.stopPropagation(),t()},this.el.addEventListener(`click`,this._onPress),e.appendChild(this.el)}setVisible(e){this.el.hidden=!e}dispose(){this.el.removeEventListener(`click`,this._onPress),this.el.remove()}},Ou=class{constructor(e=document.body,t=null,n=null){this.controls=t,this.audio=n,this.el=document.createElement(`div`),this.el.className=`stats-overlay`,this.el.textContent=`measuring...`,e.appendChild(this.el),this._acc=0}setVisible(e){this.el&&(this.el.hidden=!e)}get visible(){return!!this.el&&!this.el.hidden}update(e,t){if(!this.visible||(this._acc+=e,this._acc<$.stats.updateInterval))return;this._acc=0;let n=t.input,r=[`FPS       `+t.fps.toFixed(1)+`  (`+t.frameMs.toFixed(2)+` ms)`,`draw call `+t.drawCalls,`triangle  `+t.triangles.toLocaleString(`en-US`),`geom `+t.geometries+`  tex `+t.textures];t.distance!==void 0&&(r.push(`dist `+Math.round(t.distance)+`  speed `+(t.speed||0).toFixed(1)+`  lean `+((t.lean||0)*180/Math.PI).toFixed(1)),r.push(`lateral `+(t.lateral>=0?`+`:``)+(t.lateral||0).toFixed(2))),n&&r.push(`steer `+n.steer.toFixed(2)+`  thr `+n.throttle.toFixed(2)+`  brk `+n.brake.toFixed(2));let i=this.controls;if(i&&i.enabled){let e=i.gravity;r.push(``),r.push(`mode `+i.mode+`  src `+(i.source||`-`)+`  secure `+(i.secure?`yes`:`NO`)),r.push(`motion `+i.motionEvents+`  /s `+i.motionRate.toFixed(0)+`  read `+i.motionReadings),r.push(`orient `+i.orientationEvents+`  /s `+i.orientationRate.toFixed(0)+`  read `+i.orientationReadings),r.push(`grav `+e.x.toFixed(2)+` `+e.y.toFixed(2)+` `+e.z.toFixed(2)+`  ang `+i.angle),r.push(`tilt `+(i.steer>=0?`+`:``)+i.steer.toFixed(3)+(i.fellBack?`  FELL BACK`:``))}let a=this.audio;a&&r.push(`audio `+a.state+`  gain `+a.gain.toFixed(2)+`  gest `+a.gestures+(a.muted?`  MUTED`:``)),this.el.textContent=r.join(`
`)}dispose(){this.el&&this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null}},ku=class{constructor(e,t){this.comfort=t,this.el=document.createElement(`button`),this.el.type=`button`,this.el.className=`comfort-toggle`,this._onPointerDown=e=>{e.stopPropagation()},this._onKeyDown=e=>{e.stopPropagation(),e.key===`Escape`&&this.el.blur()},this._onClick=e=>{e.stopPropagation(),this.comfort.toggle(),this.render()},this.el.addEventListener(`pointerdown`,this._onPointerDown),this.el.addEventListener(`keydown`,this._onKeyDown),this.el.addEventListener(`click`,this._onClick),e.appendChild(this.el),this._unsubscribe=t.subscribe(()=>this.render()),this.render()}render(){let e=$.ui.comfort,t=this.comfort.reduced;this.el.textContent=(t?e.on:e.off)+`  `+e.label,this.el.classList.toggle(`comfort-on`,t),this.el.setAttribute(`aria-pressed`,t?`true`:`false`)}dispose(){this._unsubscribe&&this._unsubscribe(),this.el.removeEventListener(`pointerdown`,this._onPointerDown),this.el.removeEventListener(`keydown`,this._onKeyDown),this.el.removeEventListener(`click`,this._onClick),this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null}},Au=class{constructor(e,t,n=null){let r=$.ui.start;this.el=document.createElement(`div`),this.el.className=`start-screen`;let i=document.createElement(`h1`);i.className=`start-title`,i.textContent=r.title;let a=document.createElement(`p`);this.prompt=a,a.className=`start-prompt`,a.textContent=matchMedia(`(hover: none)`).matches?r.promptTouch:r.promptKey,this.el.append(i,a),this.toggle=n?new ku(this.el,n):null,e.appendChild(this.el),this._onStart=t,this._done=!1,this._start=this._start.bind(this),window.addEventListener(`pointerdown`,this._start),window.addEventListener(`keydown`,this._start)}_start(e){if(this._done)return;if(e.type===`keydown`){let t=e.key;if(t===`Shift`||t===`Control`||t===`Alt`||t===`Meta`)return}this._done=!0,window.removeEventListener(`pointerdown`,this._start),window.removeEventListener(`keydown`,this._start),this._onStart(),this.el.classList.add(`start-leaving`);let t=()=>this.dispose();this.el.addEventListener(`transitionend`,t,{once:!0}),this._fallback=setTimeout(t,$.ui.start.fadeMs+120)}get started(){return this._done}skip(){this._done=!0,this.dispose()}dispose(){this.toggle&&=(this.toggle.dispose(),null),window.removeEventListener(`pointerdown`,this._start),window.removeEventListener(`keydown`,this._start),clearTimeout(this._fallback),this.el&&this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null}},ju={TITLE:`title`,RUNNING:`running`,PAUSED:`paused`,OVER:`over`,FREE:`free`},Mu=class{constructor(){this.phase=ju.TITLE,this.score=0,this.distance=0,this.nearMisses=0,this.best=Nu(),this.lives=$.game.crashesAllowed,this.invulnerable=0,this.isRecord=!1,this._startDistance=0,this._startHits=0,this._startNearMisses=0,this._countedHits=0,this._overAt=0,this.overShown=!1}get scoring(){return this.phase===ju.RUNNING}begin(e){this.phase=ju.RUNNING,this.score=0,this.distance=0,this.nearMisses=0,this.isRecord=!1,this.overShown=!1,this.lives=$.game.crashesAllowed,this.invulnerable=0,this._startDistance=e.distance||0,this._startHits=e.hits||0,this._startNearMisses=e.nearMisses||0,this._countedHits=0}free(){this.phase=ju.FREE}togglePause(){return this.phase===ju.RUNNING?(this.phase=ju.PAUSED,!0):this.phase===ju.PAUSED&&(this.phase=ju.RUNNING,!0)}publish(e){e.scoring=this.scoring,e.invulnerable=this.phase===ju.RUNNING?this.invulnerable:0}update(e,t){if(this.phase===ju.OVER&&!this.overShown){this._overAt-=e,this._overAt<=0&&(this.overShown=!0);return}if(this.phase!==ju.RUNNING)return;let n=$.game;this.distance=Math.max(0,(t.distance||0)-this._startDistance),this.nearMisses=(t.nearMisses||0)-this._startNearMisses,this.score=Math.floor(this.distance*n.pointsPerUnit+this.nearMisses*n.nearMissPoints),this.invulnerable=Math.max(0,this.invulnerable-e),t.invulnerable=this.invulnerable;let r=(t.hits||0)-this._startHits;r>this._countedHits&&(this._countedHits=r,this.invulnerable<=0&&(--this.lives,this.invulnerable=n.invulnerable,t.invulnerable=this.invulnerable,this.lives<=0&&this._end()))}_end(){this.phase=ju.OVER,this._overAt=$.game.overDelay,this.overShown=!1,this.score>this.best&&(this.best=this.score,this.isRecord=!0,Pu(this.best))}};function Nu(){try{let e=window.localStorage.getItem($.game.storageKey),t=Number.parseInt(e,10);return Number.isFinite(t)&&t>0?t:0}catch{return 0}}function Pu(e){try{window.localStorage.setItem($.game.storageKey,String(e))}catch{}}var Fu=class{constructor(e,t){this.session=t,this.el=document.createElement(`div`),this.el.className=`hud`,this.el.hidden=!0,this.scoreEl=document.createElement(`div`),this.scoreEl.className=`hud-score`,this.metaEl=document.createElement(`div`),this.metaEl.className=`hud-meta`,this.livesEl=document.createElement(`div`),this.livesEl.className=`hud-lives`,this.el.append(this.scoreEl,this.livesEl,this.metaEl),e.appendChild(this.el),this._score=-1,this._meta=``,this._lives=-1}update(){let e=this.session,t=e.phase===ju.RUNNING||e.phase===ju.PAUSED;if(this.el.hidden!==!t&&(this.el.hidden=!t),!t)return;if(e.score!==this._score&&(this._score=e.score,this.scoreEl.textContent=Iu(e.score)),e.lives!==this._lives){this._lives=e.lives;let t=$.ui.lives,n=$.game.crashesAllowed,r=``;for(let i=0;i<n;i++)r+=i<e.lives?t.full:t.empty;this.livesEl.textContent=r}let n=$.ui.hud,r=Math.floor(e.distance)+n.distanceUnit+(e.nearMisses>0?`   `+n.nearMiss+` `+e.nearMisses:``);r!==this._meta&&(this._meta=r,this.metaEl.textContent=r)}dispose(){this.el&&this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null}};function Iu(e){return String(Math.max(0,Math.floor(e))).replace(/\B(?=(\d{3})+(?!\d))/g,` `)}var Lu=class{constructor(e,t,n=null){this.controls=t,this.audio=n,this.el=document.createElement(`div`),this.el.className=`controls-panel`,this.modeBtn=document.createElement(`button`),this.modeBtn.type=`button`,this.modeBtn.className=`controls-btn`,this.sensBtn=document.createElement(`button`),this.sensBtn.type=`button`,this.sensBtn.className=`controls-btn`,this.calBtn=document.createElement(`button`),this.calBtn.type=`button`,this.calBtn.className=`controls-btn`,this.calBtn.textContent=$.ui.controls.recentre,this.soundBtn=document.createElement(`button`),this.soundBtn.type=`button`,this.soundBtn.className=`controls-btn`,this.el.append(this.modeBtn,this.sensBtn,this.calBtn,this.soundBtn),e.appendChild(this.el),this._onMode=e=>{e.stopPropagation(),t.setMode(t.mode===`tilt`?`touch`:`tilt`),this.refresh()},this._onSens=e=>{e.stopPropagation(),t.cycleSensitivity(),this.refresh()},this._onCal=e=>{e.stopPropagation(),t.recalibrate(),this.calBtn.textContent=$.ui.controls.recentred,clearTimeout(this._calTimer),this._calTimer=setTimeout(()=>{this.calBtn.textContent=$.ui.controls.recentre},1400)},this._onSound=e=>{e.stopPropagation(),this.audio&&(this.audio.unlock(),this.audio.toggleMute()),this.refresh()};for(let[e,t]of[[this.modeBtn,this._onMode],[this.sensBtn,this._onSens],[this.calBtn,this._onCal],[this.soundBtn,this._onSound]])e.addEventListener(`click`,t),e.addEventListener(`pointerdown`,e=>e.stopPropagation());this.refresh()}refresh(){let e=this.controls.mode===`tilt`,t=$.ui.controls;this.modeBtn.textContent=e?t.modeTilt:t.modeTouch,this.sensBtn.textContent=t.sensitivity+$.controls.tilt.sensitivity.toFixed(1),this.sensBtn.hidden=!e,this.calBtn.hidden=!e,this.soundBtn.hidden=!this.audio,this.audio&&(this.soundBtn.textContent=this.audio.muted?t.soundOff:t.soundOn)}setVisible(e){this.el.hidden=!e,e&&this.refresh()}dispose(){clearTimeout(this._calTimer),this.modeBtn.removeEventListener(`click`,this._onMode),this.sensBtn.removeEventListener(`click`,this._onSens),this.calBtn.removeEventListener(`click`,this._onCal),this.soundBtn.removeEventListener(`click`,this._onSound),this.el.remove()}},Ru=class{constructor(e,t,n=null,r=null,i=null){this.session=t,this.el=document.createElement(`div`),this.el.className=`panel`,this.el.hidden=!0,this.titleEl=document.createElement(`h2`),this.titleEl.className=`panel-title`,this.scoreEl=document.createElement(`div`),this.scoreEl.className=`panel-score`,this.bestEl=document.createElement(`div`),this.bestEl.className=`panel-best`,this.promptEl=document.createElement(`p`),this.promptEl.className=`panel-prompt`,this.readEl=document.createElement(`div`),this.readEl.className=`panel-read`,this.readEl.append(this.titleEl,this.scoreEl,this.bestEl,this.promptEl),this.actionsEl=document.createElement(`div`),this.actionsEl.className=`panel-actions`,this.el.append(this.readEl,this.actionsEl),this.toggle=n?new ku(this.actionsEl,n):null,this.controlsPanel=r?new Lu(this.actionsEl,r,i):null,e.appendChild(this.el),this._shown=null}update(){let e=this.session,t=e.phase===ju.PAUSED?ju.PAUSED:e.phase===ju.OVER&&e.overShown?ju.OVER:null;if(t===this._shown)return;if(this._shown=t,!t){this.el.classList.remove(`panel-in`),this.el.hidden=!0;return}let n=$.ui.panel,r=matchMedia(`(hover: none)`).matches;t===ju.PAUSED?(this.titleEl.textContent=n.pausedTitle,this.scoreEl.textContent=Iu(e.score),this.bestEl.textContent=``,this.promptEl.textContent=r?n.resumeTouch:n.resumeKey):(this.titleEl.textContent=n.overTitle,this.scoreEl.textContent=Iu(e.score),this.bestEl.textContent=e.isRecord?n.record:n.best+` `+Iu(e.best),this.promptEl.textContent=r?n.restartTouch:n.restartKey),this.toggle&&(this.toggle.el.hidden=t!==ju.PAUSED),this.controlsPanel&&this.controlsPanel.setVisible(t===ju.PAUSED),this.el.classList.toggle(`panel-record`,t===ju.OVER&&e.isRecord),this.el.hidden=!1,this.el.offsetWidth,this.el.classList.add(`panel-in`)}dispose(){this.toggle&&=(this.toggle.dispose(),null),this.controlsPanel&&=(this.controlsPanel.dispose(),null),this.el&&this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null}};function zu(e=1){let t=e>>>0;function n(){t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}return{next:n,range(e,t){return e+(t-e)*n()},pick(e){return e[Math.floor(n()*e.length)]},pickWeighted(e){let t=0;for(let n=0;n<e.length;n++)t+=e[n].weight;let r=n()*t;for(let t=0;t<e.length;t++)if(r-=e[t].weight,r<=0)return e[t];return e[e.length-1]},gaussian(){return(n()+n()+n()+n()+n()+n()-3)*1.4142135623730951}}}function Bu(e,t=2,n=1313165134){let r=Math.max(1,Math.floor(e.sampleRate*t)),i=e.createBuffer(1,r,e.sampleRate),a=i.getChannelData(0),o=zu(n);for(let e=0;e<r;e++)a[e]=o.next()*2-1;let s=Math.min(2048,r>>2);for(let e=0;e<s;e++){let t=e/s,n=r-s+e;a[n]=a[n]*(1-t)+a[e]*t}return i}function Vu(e=1024){let t=new Float32Array(e);for(let n=0;n<e;n++){let r=n/(e-1)*2-1;t[n]=Math.tanh(r*2)/Math.tanh(2)}return t}function Hu(e,t){let n=new Float32Array(t.length+1),r=new Float32Array(t.length+1);for(let e=0;e<t.length;e++)r[e+1]=e%2==0?t[e]:-t[e];return e.createPeriodicWave(n,r,{disableNormalization:!1})}function Uu(e,t){let n=e.createBufferSource();return n.buffer=t,n.loop=!0,n.start(),n}var Wu=class{constructor(e,t,n){let r=$.audio.engine;this.ctx=e,this.out=e.createGain(),this.out.gain.value=0,this.out.connect(t),this.tone=e.createBiquadFilter(),this.tone.type=`lowpass`,this.tone.frequency.value=r.tone.closed,this.tone.Q.value=r.tone.q,this.tone.connect(this.out),this.trim=e.createGain(),this.trim.gain.value=r.trim,this.trim.connect(this.tone),this.formants=[];let i=this.trim;for(let t=r.formants.length-1;t>=0;t--){let n=r.formants[t],a=e.createBiquadFilter();a.type=`peaking`,a.frequency.value=n.frequency,a.Q.value=n.q,a.gain.value=n.gain,a.connect(i),i=a,this.formants.unshift(a)}this.shaper=e.createWaveShaper(),this.shaper.curve=Vu(r.drive.curveSteps),this.shaper.oversample=`2x`,this.shaper.connect(i),this.drive=e.createGain(),this.drive.gain.value=r.drive.idle,this.drive.connect(this.shaper);let a=Hu(e,r.partials);this.osc=e.createOscillator(),this.osc.setPeriodicWave(a),this.osc.connect(this.drive),this.osc.start(),this.oscDetuned=e.createOscillator(),this.oscDetuned.setPeriodicWave(a),this.oscDetuned.detune.value=r.detuneCents,this.detuneGain=e.createGain(),this.detuneGain.gain.value=r.detuneGain,this.oscDetuned.connect(this.detuneGain),this.detuneGain.connect(this.drive),this.oscDetuned.start(),this.intakeFilter=e.createBiquadFilter(),this.intakeFilter.type=`bandpass`,this.intakeFilter.frequency.value=r.intake.low,this.intakeFilter.Q.value=r.intake.q,this.intakeGain=e.createGain(),this.intakeGain.gain.value=0,this.intakeFilter.connect(this.intakeGain),this.intakeGain.connect(this.drive),this.noise=Uu(e,n),this.noise.connect(this.intakeFilter),this._gear=-1,this._shiftUntil=0}update(e,t){let n=$.audio.engine,r=this.ctx.currentTime,i=$.audio.master.tau,a=Gu(t.rpm||0),o=t.input,s=o?Gu(o.brake):0,c=Gu((t.drive===void 0?0:t.drive)*(1-s)),l=(n.idleRpm+(n.redlineRpm-n.idleRpm)*a)/60*n.firingsPerRev,u=r<this._shiftUntil,d=u?n.shift.glide:i;this.osc.frequency.setTargetAtTime(l,r,d),this.oscDetuned.frequency.setTargetAtTime(l,r,d),t.gear!==this._gear&&(t.gear>this._gear&&this._gear>0&&(this._shiftUntil=r+n.shift.duckMs/1e3),this._gear=t.gear);let f=+(c>n.overrun.below),p=f?c:0,m=n.drive.idle+(n.drive.full-n.drive.idle)*a*(1-n.drive.fromThrottle)+(n.drive.full-n.drive.idle)*p*n.drive.fromThrottle;this.drive.gain.setTargetAtTime(u?n.drive.idle:m,r,i);let h=n.tone.closed+(n.tone.open-n.tone.closed)*p+n.tone.fromRpm*a*(f?1:.25);this.tone.frequency.setTargetAtTime(h,r,i);let g=n.intake.low+(n.intake.high-n.intake.low)*a;this.intakeFilter.frequency.setTargetAtTime(g,r,i);let _=n.intake.gain*(1-n.intake.fromThrottle+n.intake.fromThrottle*p)*(.35+.65*a);this.intakeGain.gain.setTargetAtTime(f?_:_*.25,r,i);let v=n.gain*(n.gainFloor+(1-n.gainFloor)*a**+n.gainExponent);f||(v*=n.overrun.gain),u&&(v*=n.shift.duck),this.out.gain.setTargetAtTime(v,r,i)}dispose(){this.osc.stop(),this.oscDetuned.stop(),this.noise.stop(),this.out.disconnect()}};function Gu(e){return e<0?0:e>1?1:e}var Ku=class{constructor(e,t,n){let r=$.audio.wind;this.ctx=e,this.out=e.createGain(),this.out.gain.value=0,this.out.connect(t),this.filter=e.createBiquadFilter(),this.filter.type=`bandpass`,this.filter.frequency.value=r.low,this.filter.Q.value=r.q,this.filter.connect(this.out),this.noise=Uu(e,n),this.noise.connect(this.filter)}update(e,t){let n=$.audio.wind,r=this.ctx.currentTime,i=$.audio.master.tau,a=qu(t.speedRatio||0);this.filter.frequency.setTargetAtTime(n.low+(n.high-n.low)*a,r,i);let o=n.gain*(n.floor+(1-n.floor)*a**+n.exponent);this.out.gain.setTargetAtTime(o,r,i)}dispose(){this.noise.stop(),this.out.disconnect()}};function qu(e){return e<0?0:e>1?1:e}var Ju=class{constructor(e,t,n,r){let i=$.audio.traffic;this.ctx=e,this.traffic=r,this.out=e.createGain(),this.out.gain.value=i.gain,this.out.connect(t),this._voiceScale=1/Math.sqrt(i.voices),this.voices=[];for(let t=0;t<i.voices;t++){let t=e.createBiquadFilter();t.type=`bandpass`,t.frequency.value=i.pass.low,t.Q.value=i.pass.q;let r=e.createStereoPanner(),a=e.createGain();a.gain.value=0;let o=Uu(e,n);o.connect(t),t.connect(r),r.connect(a),a.connect(this.out),this.voices.push({source:o,filter:t,panner:r,gain:a})}let a=$.audio.traffic.siren;this.siren={osc:e.createOscillator(),panner:e.createStereoPanner(),gain:e.createGain(),high:!1},this.siren.osc.setPeriodicWave(Yu(e,a.partials)),this.siren.osc.frequency.value=a.toneA,this.siren.gain.gain.value=0,this.siren.osc.connect(this.siren.panner),this.siren.panner.connect(this.siren.gain),this.siren.gain.connect(this.out),this.siren.osc.start();let o=$.world.traffic.types.find(e=>e.beacon);this.beaconRate=o?o.beacon.rate:0,this.beaconName=o?o.name:null,this._near=[]}update(e,t){let n=$.audio.traffic,r=this.ctx.currentTime,i=$.audio.master.tau,a=$.player.bike.maxSpeed,o=t.distance||0,s=t.lateral||0,c=t.speed||0,l=this._near;l.length=0;let u=null,d=this.traffic.fleets;for(let e=0;e<d.length;e++){let t=d[e],r=t.type.name===this.beaconName,i=t.vehicles;for(let e=0;e<i.length;e++){let t=i[e];if(!t.active)continue;let c=t.distance-o,d=t.lateral-s,f=Math.hypot(c,d);r&&f<n.siren.range&&(!u||f<u.gap)&&(u={gap:f,along:c,across:d}),!(f>n.range)&&l.push({gap:f,along:c,across:d,speed:t.speed*a})}}l.sort(Xu);for(let e=0;e<this.voices.length;e++){let t=this.voices[e],o=l[e];if(!o){t.gain.gain.setTargetAtTime(0,r,i);continue}let s=(o.along>=0?1:-1)*(o.speed-c),u=1-n.doppler.strength*s/a;u=Zu(u,1/n.doppler.maxShift,n.doppler.maxShift);let d=1-o.gap/n.range,f=d*d*this._voiceScale,p=n.pass.low+(n.pass.high-n.pass.low)*f;t.filter.frequency.setTargetAtTime(p*u,r,i),t.gain.gain.setTargetAtTime(f,r,i),t.panner.pan.setTargetAtTime(Zu(o.across/6,-1,1),r,i)}this._updateSiren(u,r,i)}_updateSiren(e,t,n){let r=$.audio.traffic.siren,i=this.siren;if(!e){i.gain.gain.setTargetAtTime(0,t,n);return}let a=Math.sin(this.traffic.beaconPhase*Math.PI*2*this.beaconRate)>=0;if(a!==i.high){i.high=a;let e=r.glide/Math.max(this.beaconRate,.001)*.5;i.osc.frequency.setTargetAtTime(a?r.toneB:r.toneA,t,Math.max(e,.005))}let o=1-e.gap/r.range;i.gain.gain.setTargetAtTime(r.gain*o*o,t,n),i.panner.pan.setTargetAtTime(Zu(e.across/8,-1,1),t,n)}dispose(){for(let e=0;e<this.voices.length;e++)this.voices[e].source.stop();this.siren.osc.stop(),this.out.disconnect()}};function Yu(e,t){let n=new Float32Array(t.length+1),r=new Float32Array(t.length+1);for(let e=0;e<t.length;e++)r[e+1]=t[e];return e.createPeriodicWave(n,r,{disableNormalization:!1})}function Xu(e,t){return e.gap-t.gap}function Zu(e,t,n){return e<t?t:e>n?n:e}function Qu(){try{return window.localStorage.getItem($.audio.storageKey)===`1`}catch{return!1}}function $u(e){try{window.localStorage.setItem($.audio.storageKey,e?`1`:`0`)}catch{}}var ed=class{constructor(){this.ctx=null,this.engine=null,this.wind=null,this.traffic=null,this.muted=Qu(),this.gestures=0,this._paused=!1,this._started=!1}get running(){return this._started&&!!this.ctx&&this.ctx.state===`running`}get state(){return this.ctx?this.ctx.state:`none`}get gain(){return this.master?this.master.gain.value:0}unlock(e){this.gestures++,this._started||this.start(e);let t=this.ctx;if(!t)return!1;if(t.state!==`running`){let e=t.resume();e&&e.catch&&e.catch(()=>{})}return t.state===`running`}start(e){if(this._started||!$.audio.enabled)return;let t=window.AudioContext||window.webkitAudioContext;if(!t){console.info(`[audio] no Web Audio in this browser; running silent`);return}this._started=!0;let n=new t({latencyHint:`interactive`});this.ctx=n;let r=$.audio.master;this.master=n.createGain(),this.master.gain.value=0;let i=n.createDynamicsCompressor();i.threshold.value=r.limiter.threshold,i.knee.value=r.limiter.knee,i.ratio.value=r.limiter.ratio,i.attack.value=r.limiter.attack,i.release.value=r.limiter.release,this.master.connect(i),i.connect(n.destination),this.limiter=i;let a=Bu(n,2,$.world.seed);this.engine=new Wu(n,this.master,a),this.wind=new Ku(n,this.master,a),e&&(this.traffic=new Ju(n,this.master,a,e)),this.master.gain.setValueAtTime(0,n.currentTime),this.muted||this.master.gain.linearRampToValueAtTime(r.gain,n.currentTime+r.startFade),n.state===`suspended`&&n.resume()}setPaused(e){if(!this.master||e===this._paused||(this._paused=e,this.muted))return;let t=$.audio.master;this.master.gain.setTargetAtTime(e?t.gain*t.pausedGain:t.gain,this.ctx.currentTime,.08)}toggleMute(e){if(this.muted=e===void 0?!this.muted:!!e,this.master){let e=$.audio.master;this.master.gain.setTargetAtTime(this.muted?0:e.gain,this.ctx.currentTime,.05)}return $u(this.muted),this.muted}update(e,t){this._started&&this.ctx&&(this.engine.update(e,t),this.wind.update(e,t),this.traffic&&this.traffic.update(e,t))}dispose(){this.ctx&&(this.engine&&this.engine.dispose(),this.wind&&this.wind.dispose(),this.traffic&&this.traffic.dispose(),this.master.disconnect(),this.limiter.disconnect(),this.ctx.close(),this.ctx=null,this._started=!1)}},td=.5*(Math.sqrt(3)-1),nd=(3-Math.sqrt(3))/6,rd=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];function id(e){let t=new Uint8Array(256);for(let e=0;e<256;e++)t[e]=e;for(let n=255;n>0;n--){let r=Math.floor(e.next()*(n+1)),i=t[n];t[n]=t[r],t[r]=i}let n=new Uint8Array(512);for(let e=0;e<512;e++)n[e]=t[e&255];return function(e,t){let r=(e+t)*td,i=Math.floor(e+r),a=Math.floor(t+r),o=(i+a)*nd,s=e-(i-o),c=t-(a-o),l=+(s>c),u=s>c?0:1,d=s-l+nd,f=c-u+nd,p=s-1+2*nd,m=c-1+2*nd,h=i&255,g=a&255,_=0,v=0,y=0,b=.5-s*s-c*c;if(b>0){let e=rd[n[h+n[g]]&7];b*=b,_=b*b*(e[0]*s+e[1]*c)}let x=.5-d*d-f*f;if(x>0){let e=rd[n[h+l+n[g+u]]&7];x*=x,v=x*x*(e[0]*d+e[1]*f)}let S=.5-p*p-m*m;if(S>0){let e=rd[n[h+1+n[g+1]]&7];S*=S,y=S*S*(e[0]*p+e[1]*m)}return 70*(_+v+y)}}function ad(e,{octaves:t=4,lacunarity:n=2,gain:r=.5}={}){return function(i,a){let o=1,s=1,c=0,l=0;for(let u=0;u<t;u++)c+=o*e(i*s,a*s),l+=o,o*=r,s*=n;return l>0?c/l:0}}var od=`
  varying vec3 vDirection;

  void main() {
    // The sphere is centered on the camera, so the local position already
    // points along the view direction for this fragment.
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,sd=`
  uniform vec3 uColorBase;
  uniform vec3 uColorMid;
  uniform vec3 uColorTop;
  uniform float uMidPoint;

  uniform vec3 uGlowColor;
  uniform vec3 uGlowDirection;
  uniform float uGlowIntensity;
  uniform float uGlowFalloff;

  varying vec3 vDirection;

  // <common> first: dithering_pars_fragment calls rand() which lives there
  #include <common>
  #include <dithering_pars_fragment>

  void main() {
    vec3 direction = normalize(vDirection);

    // Remap the vertical component from [-1, 1] to [0, 1]
    float h = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 color = mix(uColorBase, uColorMid, smoothstep(0.0, uMidPoint, h));
    color = mix(color, uColorTop, smoothstep(uMidPoint, 1.0, h));

    // Localized glow: a pool of color around one direction, not a global wash
    float facing = max(dot(direction, uGlowDirection), 0.0);
    color += uGlowColor * pow(facing, uGlowFalloff) * uGlowIntensity;

    gl_FragColor = vec4(color, 1.0);

    // No tone mapping here on purpose: the gradient stops are authored as
    // display colors, and ACES crushes dark saturated purple into flat blue.
    #include <colorspace_fragment>
    // Dithering matters here: a dark gradient across the whole screen is
    // exactly where 8 bit banding shows up.
    #include <dithering_fragment>
  }
`,cd=class{constructor(){let e=$.sky.dome,t=e.glow;this.geometry=new ra(e.radius,e.widthSegments,e.heightSegments);let n=new W(Math.cos(t.elevation)*Math.cos(t.azimuth),Math.sin(t.elevation),Math.cos(t.elevation)*Math.sin(t.azimuth)).normalize();this.material=new pa({uniforms:{uColorBase:{value:new J(e.colorBase)},uColorMid:{value:new J(e.colorMid)},uColorTop:{value:new J(e.colorTop)},uMidPoint:{value:e.midPoint},uGlowColor:{value:new J(t.color)},uGlowDirection:{value:n},uGlowIntensity:{value:t.intensity},uGlowFalloff:{value:t.falloff}},vertexShader:od,fragmentShader:sd,side:1,depthWrite:!1,dithering:!0,fog:!1}),this.mesh=new mi(this.geometry,this.material),this.mesh.name=`SkyDome`,this.mesh.renderOrder=-30,this.mesh.frustumCulled=!1}applyTheme(){let e=$.sky.dome,t=e.glow,n=this.material.uniforms;n.uColorBase.value.set(e.colorBase),n.uColorMid.value.set(e.colorMid),n.uColorTop.value.set(e.colorTop),n.uMidPoint.value=e.midPoint,n.uGlowColor.value.set(t.color),n.uGlowIntensity.value=t.intensity,n.uGlowFalloff.value=t.falloff,n.uGlowDirection.value.set(Math.cos(t.elevation)*Math.cos(t.azimuth),Math.sin(t.elevation),Math.cos(t.elevation)*Math.sin(t.azimuth)).normalize()}dispose(){this.geometry.dispose(),this.material.dispose()}};function ld(e){let t=document.createElement(`canvas`);return t.width=e,t.height=e,{canvas:t,ctx:t.getContext(`2d`)}}function ud(e,t,n){if(t<=e)return n<e?0:1;let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)}function dd(e){return`rgba(255, 255, 255, `+e+`)`}function fd(e,t=64){let{canvas:n,ctx:r}=ld(t),i=t/2,a=r.createRadialGradient(i,i,0,i,i,i);a.addColorStop(0,dd(1)),a.addColorStop(e.coreStop,dd(e.coreAlpha)),a.addColorStop(e.midStop,dd(e.midAlpha)),a.addColorStop(e.tailStop,dd(e.tailAlpha)),a.addColorStop(1,dd(0)),r.fillStyle=a,r.fillRect(0,0,t,t);let o=new zi(n);return o.name=`star-sprite`,o}function pd({size:e=256,fbm2D:t,scale:n=2.6,offsetX:r=0,offsetY:i=0,falloffPower:a=1.35,contrastLow:o=.34,contrastHigh:s=.86}){let{canvas:c,ctx:l}=ld(e),u=l.createImageData(e,e),d=u.data,f=1/e;for(let c=0;c<e;c++)for(let l=0;l<e;l++){let u=(c*e+l)*4;d[u]=255,d[u+1]=255,d[u+2]=255;let p=l*f*2-1,m=c*f*2-1,h=Math.sqrt(p*p+m*m);if(h>=1){d[u+3]=0;continue}let g=(1-h)**a,_=ud(o,s,t(p*n+r,m*n+i)*.5+.5);d[u+3]=Math.round(Math.min(1,_*g)*255)}l.putImageData(u,0,0);let p=new zi(c);return p.name=`nebula-cloud`,p}var md=Math.PI*2,hd=new W(0,1,0),gd=class{constructor(e,t){this.rng=e,this.noise2D=t;let n=$.sky.stars.trails,r=new W(Math.cos(n.pole.elevation)*Math.cos(n.pole.azimuth),Math.sin(n.pole.elevation),Math.cos(n.pole.elevation)*Math.sin(n.pole.azimuth)).normalize(),i=new Dt().setFromUnitVectors(hd,r),a=new an,o=new Dt;this.curves=[];let s=0;for(let t=0;t<n.curves;t++){let r=n.curves>1?t/(n.curves-1):.5,c=n.polarMin+(n.polarMax-n.polarMin)*r+e.gaussian()*n.polarJitter;a.set(e.gaussian()*n.tiltJitter,e.gaussian()*n.tiltJitter,e.gaussian()*n.tiltJitter),o.setFromEuler(a);let l=Math.sin(c)*n.weightFalloff**+t;s+=l,this.curves.push({polarAngle:c,weight:l,cumulative:s,quaternion:i.clone().multiply(o),noiseOffset:e.range(-100,100),wobbleOffset:e.range(-100,100)})}this.weightSum=s}sample(e){let t=$.sky.stars.trails,n=this.rng.next()*this.weightSum,r=this.curves[this.curves.length-1];for(let e=0;e<this.curves.length;e++)if(n<=this.curves[e].cumulative){r=this.curves[e];break}let i=0;for(let e=0;e<t.attempts;e++){i=this.rng.next()*md;let n=Math.cos(i)*t.densityScale+r.noiseOffset,a=Math.sin(i)*t.densityScale+r.noiseOffset,o=.5+.5*this.noise2D(n,a),s=t.densityFloor+(1-t.densityFloor)*o**+t.densityContrast,c=e===t.attempts-1;if(!(this.rng.next()>s&&!c))break}let a=Math.cos(i)*t.wobbleScale+r.wobbleOffset,o=Math.sin(i)*t.wobbleScale+r.wobbleOffset,s=r.polarAngle+this.noise2D(a,o)*t.wobbleAmount+this.rng.gaussian()*t.jitter,c=Math.sin(s);return e.set(c*Math.cos(i),Math.cos(s),c*Math.sin(i)),e.applyQuaternion(r.quaternion)}},_d=Math.PI*2,vd=`
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  attribute float aBrightness;
  attribute float aIsTrail;

  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uTwinkleAmount;
  uniform float uTrailBrightness;
  uniform float uTwinkleSpeed;

  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    vColor = aColor;

    float wave = 0.5 + 0.5 * sin(uTime * uTwinkleSpeed + aPhase);
    // TRAIL BRIGHTNESS IS APPLIED HERE, not baked into aBrightness. It used
    // to be multiplied in on the CPU while the buffer was being filled, which
    // made it the one sky value a road change could not touch without
    // rewriting ~36,000 floats. One attribute and one uniform instead.
    float brightness = aBrightness * mix(1.0, uTrailBrightness, aIsTrail);
    vIntensity = brightness * (1.0 - uTwinkleAmount + uTwinkleAmount * wave);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Size is authored in CSS pixels, so scale it by the device pixel ratio
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
  }
`,yd=`
  uniform sampler2D uMap;
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    vec4 texel = texture2D(uMap, gl_PointCoord);
    if (texel.a < 0.01) discard;

    gl_FragColor = vec4(vColor, texel.a * uOpacity * vIntensity);

    // The sky is authored in display space; see SkyDome for the reasoning.
    #include <colorspace_fragment>
  }
`,bd=class e{constructor(e,t){this.rng=e,this.time=0,this.group=new Cn,this.group.name=`Starfield`,this.trails=new gd(e,t),this.texture=fd($.sky.stars.texture,$.sky.stars.textureSize),this.palette=$.sky.stars.palette.map(e=>({weight:e.weight,color:new J(e.color)})),this.layers=$.sky.stars.layers.map(e=>this._createLayer(e))}_createLayer(t){let n=$.sky.stars,r=t.count,i=new Float32Array(r*3),a=new Float32Array(r*3),o=new Float32Array(r),s=new Float32Array(r),c=new Float32Array(r),l=new Float32Array(r),u=new W,d=Math.round(r*t.galacticFraction),f=t.sizeMax-t.sizeMin;for(let e=0;e<r;e++){let n=e<d;n?this.trails.sample(u):this._sampleUniformDirection(u);let r=e*3;i[r]=u.x*t.radius,i[r+1]=u.y*t.radius,i[r+2]=u.z*t.radius;let p=this.rng.pickWeighted(this.palette);a[r]=p.color.r,a[r+1]=p.color.g,a[r+2]=p.color.b;let m=this.rng.next()**+t.sizeExponent;o[e]=t.sizeMin+f*m,c[e]=t.brightness*(.55+.45*m),l[e]=+!!n,s[e]=this.rng.next()*_d}let p=new Tr;p.setAttribute(`position`,new Y(i,3)),p.setAttribute(`aColor`,new Y(a,3)),p.setAttribute(`aSize`,new Y(o,1)),p.setAttribute(`aPhase`,new Y(s,1)),p.setAttribute(`aBrightness`,new Y(c,1)),p.setAttribute(`aIsTrail`,new Y(l,1));let m=new pa({uniforms:{uMap:{value:this.texture},uOpacity:{value:t.opacity},uPixelRatio:{value:e.currentPixelRatio()},uTime:{value:0},uTwinkleAmount:{value:n.twinkleAmount},uTrailBrightness:{value:n.trailBrightness},uTwinkleSpeed:{value:n.twinkleSpeed}},vertexShader:vd,fragmentShader:yd,transparent:!0,blending:2,depthWrite:!1,fog:!1}),h=new Ii(p,m);h.name=`stars-`+t.name,h.renderOrder=-20,h.frustumCulled=!1;let g=new Cn;return g.rotation.set(t.tilt.x,0,t.tilt.z),g.add(h),this.group.add(g),{points:h,geometry:p,material:m,tiltGroup:g,rotationSpeed:t.rotationSpeed}}_sampleUniformDirection(e){let t=this.rng.next()*2-1,n=this.rng.next()*_d,r=Math.sqrt(Math.max(0,1-t*t));return e.set(r*Math.cos(n),t,r*Math.sin(n))}update(t){this.time+=t;let n=e.currentPixelRatio();for(let e=0;e<this.layers.length;e++){let r=this.layers[e];r.points.rotation.y+=r.rotationSpeed*t,r.material.uniforms.uTime.value=this.time,r.material.uniforms.uPixelRatio.value=n}}applyTheme(){let e=$.sky.stars;for(let t of this.layers){let n=t.material.uniforms;n.uTwinkleAmount.value=e.twinkleAmount,n.uTrailBrightness.value=e.trailBrightness}}dispose(){for(let e=0;e<this.layers.length;e++){let t=this.layers[e];t.geometry.dispose(),t.material.dispose(),t.tiltGroup.clear()}this.layers.length=0,this.texture.dispose(),this.group.clear()}static currentPixelRatio(){return Math.min(window.devicePixelRatio,$.renderer.maxPixelRatio)}},xd=Math.PI*2;function Sd(){let e=$.sky.nebula.clouds.length;for(let t of Object.values($.themes)){let n=t&&t.sky&&t.sky.nebula&&t.sky.nebula.clouds;Array.isArray(n)&&n.length>e&&(e=n.length)}return e}var Cd=class{constructor(e,t){let n=$.sky.nebula;this.time=0,this.group=new Cn,this.group.name=`Nebula`;let r=ad(t,n.fbm);this.textures=[];for(let e=0;e<n.textureVariants;e++)this.textures.push(pd({size:n.textureSize,fbm2D:r,scale:n.noiseScale,offsetX:31.7*e+4.2,offsetY:-18.3*e+9.6,falloffPower:n.falloffPower,contrastLow:n.contrastLow,contrastHigh:n.contrastHigh}));let i=Sd();this.clouds=[];for(let t=0;t<i;t++){let r=n.clouds[t]||n.clouds[0],i=this._createCloud(r,e);i.live=t<n.clouds.length,i.live||(i.baseOpacity=0),this.clouds.push(i)}}applyTheme(){let e=$.sky.nebula;for(let t=0;t<this.clouds.length;t++){let n=this.clouds[t],r=e.clouds[t];if(n.live=!!r,!r){n.baseOpacity=0;continue}n.material.color.set(r.color),n.material.rotation=r.rotation,n.baseOpacity=r.opacity,n.baseScale=r.scale,n.breathSpeed=r.breathSpeed,n.breathAmount=r.breathAmount;let i=Math.cos(r.elevation)*r.distance;n.sprite.position.set(i*Math.cos(r.azimuth),Math.sin(r.elevation)*r.distance,i*Math.sin(r.azimuth))}}_createCloud(e,t){let n=this.textures[e.variant%this.textures.length],r=new Fr({map:n,color:new J(e.color),opacity:e.opacity,transparent:!0,blending:2,depthWrite:!1,rotation:e.rotation,toneMapped:!1,fog:!1}),i=new Yr(r);i.name=`nebula-cloud`,i.renderOrder=-10,i.frustumCulled=!1;let a=Math.cos(e.elevation)*e.distance;return i.position.set(a*Math.cos(e.azimuth),Math.sin(e.elevation)*e.distance,a*Math.sin(e.azimuth)),i.scale.set(e.scale,e.scale,1),this.group.add(i),{sprite:i,material:r,baseOpacity:e.opacity,baseScale:e.scale,breathSpeed:e.breathSpeed,breathAmount:e.breathAmount,phase:t.next()*xd}}update(e){this.time+=e;for(let e=0;e<this.clouds.length;e++){let t=this.clouds[e],n=Math.sin(this.time*t.breathSpeed*xd+t.phase);t.material.opacity=Math.max(0,t.baseOpacity*(1+t.breathAmount*n)),t.sprite.visible=t.material.opacity>.002;let r=t.baseScale*(1+.03*n);t.sprite.scale.set(r,r,1)}}dispose(){for(let e=0;e<this.clouds.length;e++)this.clouds[e].material.dispose();for(let e=0;e<this.textures.length;e++)this.textures[e].dispose();this.clouds.length=0,this.textures.length=0,this.group.clear()}},wd=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Td=`
  uniform float uTime;
  uniform float uWavePhase;
  uniform float uArcPhase;
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform vec3 uWarmColor;
  uniform float uIntensity;
  uniform float uWarmIntensity;
  uniform float uWarmHeight;
  uniform float uCurtainHeight;
  uniform float uCurtainVariation;
  uniform float uFadeBottom;
  uniform float uWaveScale;
  uniform float uRayScale;
  uniform float uRayContrast;
  uniform float uRayHeight;
  uniform float uWarpScale;
  uniform float uWarpAmount;
  uniform float uClusterScale;
  uniform float uClusterFloor;
  uniform float uClusterRange;
  uniform float uArcCenter;
  uniform float uArcHalfWidth;
  uniform float uArcSoftness;
  uniform float uWarmArcScale;
  uniform float uWarmFloor;

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    vec2 w = f * f * (3.0 - 2.0 * f);

    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
  }

  /** Soft sided mask for one arc of the ring. */
  float arcMask(float angle, float center, float halfWidth, float softness) {
    float delta = angle - center;
    delta = atan(sin(delta), cos(delta)); // wrap into [-PI, PI]
    float inner = halfWidth * (1.0 - softness);
    return 1.0 - smoothstep(inner, halfWidth, abs(delta));
  }

  void main() {
    // CylinderGeometry lays out x = r*sin(theta), z = r*cos(theta), so the
    // world azimuth is PI/2 - theta. Converting here lets arcCenter be a real
    // azimuth, the same convention the nebula and the dome glow use.
    float angle = 1.5707963267948966 - vUv.x * 6.283185307179586;
    float center = uArcCenter + uArcPhase;

    float curtainArc = arcMask(angle, center, uArcHalfWidth, uArcSoftness);
    float warmArc = arcMask(angle, center, uArcHalfWidth * uWarmArcScale, uArcSoftness);

    // Most of the cylinder is outside the arc; skip it entirely
    if (warmArc <= 0.0001) discard;

    // Domain warp before sampling the rays
    float warp = (valueNoise(
      vec2(cos(angle), sin(angle)) * uWarpScale + vec2(0.0, uWavePhase * 0.7)
    ) - 0.5) * uWarpAmount;

    vec2 ring = vec2(cos(angle + warp), sin(angle + warp));

    float slow = valueNoise(ring * uWaveScale + vec2(0.0, uWavePhase));

    float coarse = valueNoise(ring * uRayScale + vec2(7.0, uWavePhase * 2.1));
    float medium = valueNoise(ring * uRayScale * 2.3 + vec2(-3.0, uWavePhase * 3.1));
    float fine = valueNoise(ring * uRayScale * 5.1 + vec2(19.0, uWavePhase * 1.3));
    float rays = coarse * 0.5 + medium * 0.32 + fine * 0.18;

    // Contrast first, envelope second. Doing it the other way round stacks
    // two attenuations on top of each other and the curtain disappears.
    rays = pow(rays, uRayContrast);

    // Cluster envelope: entire stretches of the arc drop out, but the regions
    // that survive stay at full strength.
    float clusters = valueNoise(ring * uClusterScale + vec2(3.0, uWavePhase * 0.5));
    rays *= smoothstep(uClusterFloor, uClusterFloor + uClusterRange, clusters);

    // The ray noise drives the height as well, so every streak reaches a
    // different altitude and the top edge never draws a straight line
    float top = uCurtainHeight
      + uCurtainVariation * (slow - 0.5) * 2.0
      + uRayHeight * (rays - 0.5);
    top = max(top, 0.06);

    // One shared fade at the very bottom so the cylinder rim never shows up
    float bottomFade = smoothstep(0.0, uFadeBottom, vUv.y);

    float body = smoothstep(top, 0.0, vUv.y) * bottomFade;
    float curtainAlpha = body * rays * uIntensity * curtainArc;

    vec3 curtainColor = mix(uColorLow, uColorHigh, clamp(vUv.y / top, 0.0, 1.0));

    // Warm under layer, modulated by the clusters so it is never a flat ring
    // The warm glow follows the rays rather than running flat along the
    // horizon. A continuous under layer is what read as a grey haze band.
    float warmAlpha = smoothstep(uWarmHeight, 0.0, vUv.y)
      * bottomFade * uWarmIntensity * warmArc
      * (uWarmFloor + (1.0 - uWarmFloor) * rays);

    // Sum the two contributions, then un-premultiply: additive blending
    // multiplies by alpha again, which reproduces exactly this sum.
    vec3 premultiplied = curtainColor * curtainAlpha + uWarmColor * warmAlpha;
    float alpha = clamp(curtainAlpha + warmAlpha, 0.0, 1.0);

    gl_FragColor = vec4(premultiplied / max(alpha, 0.0001), alpha);

    // The sky is authored in display space; see SkyDome for the reasoning.
    #include <colorspace_fragment>
  }
`,Ed=class{constructor(){let e=$.sky.aurora;this._builtRadius=e.radius,this._builtHeight=e.height,this.geometry=new Ui(e.radius,e.radius,e.height,e.radialSegments,1,!0),this.material=new pa({uniforms:{uTime:{value:0},uWavePhase:{value:0},uArcPhase:{value:0},uColorLow:{value:new J(e.colorLow)},uColorHigh:{value:new J(e.colorHigh)},uWarmColor:{value:new J(e.warmColor)},uIntensity:{value:e.intensity},uWarmIntensity:{value:e.warmIntensity},uWarmHeight:{value:e.warmHeight},uCurtainHeight:{value:e.curtainHeight},uCurtainVariation:{value:e.curtainVariation},uFadeBottom:{value:e.fadeBottom},uWaveScale:{value:e.waveScale},uRayScale:{value:e.rayScale},uRayContrast:{value:e.rayContrast},uRayHeight:{value:e.rayHeight},uWarpScale:{value:e.warpScale},uWarpAmount:{value:e.warpAmount},uClusterScale:{value:e.clusterScale},uClusterFloor:{value:e.clusterFloor},uClusterRange:{value:e.clusterRange},uArcCenter:{value:e.arcCenter},uArcHalfWidth:{value:e.arcHalfWidth},uArcSoftness:{value:e.arcSoftness},uWarmArcScale:{value:e.warmArcScale},uWarmFloor:{value:e.warmFloor}},vertexShader:wd,fragmentShader:Td,side:1,transparent:!0,blending:2,depthWrite:!1,fog:!1}),this.mesh=new mi(this.geometry,this.material),this.mesh.name=`Aurora`,this.mesh.renderOrder=-5,this.mesh.frustumCulled=!1,this.mesh.position.y=e.baseY+e.height*.5,this.time=0,this.wavePhase=0,this.arcPhase=0}applyTheme(){let e=$.sky.aurora,t=this.material.uniforms;t.uColorLow.value.set(e.colorLow),t.uColorHigh.value.set(e.colorHigh),t.uWarmColor.value.set(e.warmColor),t.uIntensity.value=e.intensity,t.uWarmIntensity.value=e.warmIntensity,t.uWarmHeight.value=e.warmHeight,t.uCurtainHeight.value=e.curtainHeight,t.uCurtainVariation.value=e.curtainVariation,t.uFadeBottom.value=e.fadeBottom,t.uWaveScale.value=e.waveScale,t.uRayScale.value=e.rayScale,t.uRayContrast.value=e.rayContrast,t.uRayHeight.value=e.rayHeight,t.uWarpScale.value=e.warpScale,t.uWarpAmount.value=e.warpAmount,t.uClusterScale.value=e.clusterScale,t.uClusterFloor.value=e.clusterFloor,t.uClusterRange.value=e.clusterRange,t.uArcCenter.value=e.arcCenter,t.uArcHalfWidth.value=e.arcHalfWidth,t.uArcSoftness.value=e.arcSoftness,t.uWarmArcScale.value=e.warmArcScale,t.uWarmFloor.value=e.warmFloor,this.mesh.scale.set(e.radius/this._builtRadius,e.height/this._builtHeight,e.radius/this._builtRadius),this.mesh.position.y=e.baseY+e.height*.5}update(e){let t=$.sky.aurora;this.time+=e,this.wavePhase+=e*t.waveSpeed,this.arcPhase+=e*t.arcDrift;let n=this.material.uniforms;n.uTime.value=this.time,n.uWavePhase.value=this.wavePhase,n.uArcPhase.value=this.arcPhase}dispose(){this.geometry.dispose(),this.material.dispose()}},Dd=class{constructor(e,t){this.scene=e,this.camera=t,this.group=new Cn,this.group.name=`Sky`,e.add(this.group);let n=zu($.sky.seed),r=id(n);this.dome=new cd,this.group.add(this.dome.mesh),this.starfield=new bd(n,r),this.group.add(this.starfield.group),this.nebula=new Cd(n,r),this.group.add(this.nebula.group),this.aurora=new Ed,this.group.add(this.aurora.mesh)}applyTheme(){this.dome.applyTheme(),this.starfield.applyTheme(),this.nebula.applyTheme(),this.aurora.applyTheme()}update(e){this.group.position.copy(this.camera.position),this.starfield.update(e),this.nebula.update(e),this.aurora.update(e)}dispose(){this.aurora.dispose(),this.nebula.dispose(),this.starfield.dispose(),this.dome.dispose(),this.scene.remove(this.group),this.group.clear(),this.scene=null,this.camera=null}},Od=new W(0,1,0),kd=0,Ad=41.7,jd=.5,Md=new W,Nd=new W,Pd=class{constructor(){let e=$.world.road;this.chunkLength=e.chunkLength,this.pointsPerChunk=e.pointsPerChunk,this.pointSpacing=e.chunkLength/e.pointsPerChunk;let t=zu($.world.seed);this._fbm=ad(id(t),e.path.fbm);let n=e.pointsPerChunk+5,r=[];for(let e=0;e<n;e++)r.push(new W);this.curve=new $i(r,!1,`centripetal`,.5);let i=n-1;this.tStart=2/i,this.tEnd=(i-2)/i,this.tSpan=this.tEnd-this.tStart,this._loadedChunk=null}controlPoint(e,t){let n=$.world.road.path,r=e*this.pointSpacing,i=this._fbm(r/n.lateralWavelength,kd),a=n.lateralStraightBias,o=i*(1-a+a*i*i),s=this._fbm(r/n.elevationWavelength,Ad);return t.set(o*n.lateralAmplitude,s*n.elevationAmplitude,-r)}useChunk(e){if(this._loadedChunk===e)return this.curve;let t=this.curve.points,n=e*this.pointsPerChunk-2;for(let e=0;e<t.length;e++)this.controlPoint(n+e,t[e]);return this._loadedChunk=e,this.curve}tAt(e){return this.tStart+e*this.tSpan}pointAt(e,t){let n=Math.floor(e/this.chunkLength),r=e/this.chunkLength-n;return this.useChunk(n).getPoint(this.tAt(r),t)}frameAt(e,t,n,r){this.pointAt(e,t),this.pointAt(e+jd,Md),this.pointAt(e-jd,Nd),n.copy(Md).sub(Nd).normalize(),r.crossVectors(n,Od).normalize()}};function Fd(){let e=$.world.road.carriageway,t=e.lanes*e.laneWidth/2,n=[],r=[];for(let i=0;i<e.lanes;i++)n.push(-t+e.laneWidth*(i+.5)),i>0&&r.push(-t+e.laneWidth*i);let i=-t-e.medianGap,a=i-e.medianWidth,o=a,s=o-e.oncomingLanes*e.laneWidth,c=[];for(let t=0;t<e.oncomingLanes;t++)c.push(o-e.laneWidth*(t+.5));return{laneWidth:e.laneWidth,laneCentres:n,laneEdges:r,left:-t,right:t,shoulderEdge:t+e.shoulderRight,medianInner:i,medianOuter:a,medianCentre:(i+a)/2,oncomingCentres:c,oncomingInner:o,oncomingOuter:s,shoulderLeft:s-e.shoulderRight,ribbonRight:t+e.shoulderRight+e.verge,ribbonLeft:s-e.shoulderRight-e.verge}}function Id(e,t){switch(t){case`shoulder`:return e.shoulderEdge;case`right`:return e.right;case`left`:return e.left;case`medianInner`:return e.medianInner;case`medianOuter`:return e.medianOuter;case`medianCentre`:return e.medianCentre;case`farVerge`:return e.shoulderLeft;default:return 0}}var Ld=new W,Rd=new W,zd=new W,Bd=class e{constructor(t){let n=$.world.road;this.chunkLength=n.chunkLength;let r=Fd();this.ribbonLeft=r.ribbonLeft,this.ribbonRight=r.ribbonRight,this.rings=n.lengthSegments+1,this.columns=n.widthSegments+1,this.alongWrap=n.strips.patternLength*n.strips.wrapCycles,this.chunkIndex=-1;let i=this.rings*this.columns;this._positions=new Float32Array(i*3),this._normals=new Float32Array(i*3),this._along=new Float32Array(i),this._centers=[];for(let e=0;e<this.rings+2;e++)this._centers.push(new W);this._lengths=new Float64Array(this.rings),this.geometry=new Tr;let a=new Y(this._positions,3),o=new Y(this._normals,3),s=new Y(this._along,1);a.setUsage(He),o.setUsage(He),s.setUsage(He),this.geometry.setAttribute(`position`,a),this.geometry.setAttribute(`normal`,o),this.geometry.setAttribute(`aAlong`,s),this.geometry.setAttribute(`aAcross`,e._buildAcross(this.rings,this.columns,this.ribbonLeft,this.ribbonRight)),this.geometry.setIndex(e._buildIndex(this.rings,this.columns)),this.mesh=new mi(this.geometry,t),this.mesh.name=`RoadChunk`,this.mesh.matrixAutoUpdate=!0}static _buildAcross(e,t,n,r){let i=new Float32Array(e*t);for(let a=0;a<t;a++){let o=n+(r-n)*a/(t-1);for(let n=0;n<e;n++)i[n*t+a]=o}return new Y(i,1)}static _buildIndex(e,t){let n=(e-1)*(t-1),r=e*t>65535?new Uint32Array(n*6):new Uint16Array(n*6),i=0;for(let n=0;n<e-1;n++)for(let e=0;e<t-1;e++){let a=n*t+e,o=a+1,s=a+t,c=s+1;r[i++]=a,r[i++]=o,r[i++]=s,r[i++]=o,r[i++]=c,r[i++]=s}return new Y(r,1)}rebuild(e,t){this.chunkIndex=t;let n=this.rings,r=this.columns,i=this._centers,a=this._lengths,o=this.ribbonLeft,s=this.ribbonRight-this.ribbonLeft,c=-t*this.chunkLength;this.mesh.position.set(0,0,c);let l=e.useChunk(t),u=1/(n-1);for(let t=0;t<n+2;t++)l.getPoint(e.tAt((t-1)*u),i[t]);a[0]=0;for(let e=1;e<n;e++)a[e]=a[e-1]+i[e+1].distanceTo(i[e]);let d=a[n-1],f=d>0?this.chunkLength/d:1,p=t*this.chunkLength,m=p-Math.floor(p/this.alongWrap)*this.alongWrap,h=this._positions,g=this._normals,_=this._along;for(let e=0;e<n;e++){let t=i[e+1];Ld.copy(i[e+2]).sub(i[e]).normalize(),Rd.crossVectors(Ld,Od).normalize(),zd.crossVectors(Rd,Ld);let n=m+a[e]*f;for(let i=0;i<r;i++){let a=e*r+i,l=o+s*i/(r-1),u=a*3;h[u]=t.x+Rd.x*l,h[u+1]=t.y+Rd.y*l,h[u+2]=t.z+Rd.z*l-c,g[u]=zd.x,g[u+1]=zd.y,g[u+2]=zd.z,_[a]=n}}this.geometry.attributes.position.needsUpdate=!0,this.geometry.attributes.normal.needsUpdate=!0,this.geometry.attributes.aAlong.needsUpdate=!0,this.geometry.computeBoundingSphere()}dispose(){this.geometry.dispose()}},Vd=`
  attribute float aAlong;
  attribute float aAcross;

  varying float vAlong;
  varying float vAcross;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>
  #include <fog_pars_vertex>

  void main() {
    vAlong = aAlong;
    vAcross = aAcross;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalMatrix * normal;
    vViewDir = -mvPosition.xyz; // the camera sits at the origin in view space

    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`,Hd=`
  uniform vec3 uAsphaltColor;
  uniform vec3 uVoidColor;
  uniform vec3 uMedianColor;

  // THE GROUND EITHER SIDE OF THE ASPHALT. On Galaxy Road it is the void
  // colour and nothing happens; on a snow pass it is what makes the theme
  // read, because the one thing a snowy highway has that a dark one does not
  // is a pale ground throwing light back up. The bank is the ploughed ridge
  // that piles against the edge of the carriageway - brightest right at the
  // asphalt, fading outward, which is exactly how a ploughed verge looks.
  uniform vec3 uGroundColor;
  uniform vec3 uBankColor;
  uniform float uBankWidth;

  // The cross section, in metres. x = near edge, y = far edge.
  uniform vec2 uOurs;       // our carriageway plus its hard shoulder
  uniform vec2 uMedian;     // the strip the barrier stands in
  uniform vec2 uOncoming;   // the other carriageway plus its shoulder
  uniform float uVergeFade; // how far the asphalt takes to die into the void
  // How much of itself the far carriageway keeps. It is twelve to twenty seven
  // metres away across a barrier and was reading as a flat navy plane laid
  // beside ours; this is what makes it recede.
  uniform float uOncomingDim;

  uniform vec3 uSheenColor;
  uniform float uSheenStrength;
  uniform float uSheenPower;
  uniform float uNeonFadeStart;
  uniform float uNeonFadeEnd;

  uniform vec3 uEdgeLeftColor;
  uniform vec3 uEdgeRightColor;
  uniform float uEdgeAt;     // metres; the line sits at -uEdgeAt and +uEdgeAt
  uniform float uEdgeWidth;
  uniform float uEdgeGlow;
  uniform float uEdgeIntensity;
  uniform float uEdgeHalo;

  // Painted lane markings. Road paint, not neon: no halo, no scroll. They are
  // world locked, so they stream past at exactly road speed.
  uniform vec3 uMarkColor;
  uniform float uMarkIntensity;
  uniform float uMarkPeriod;   // dash + gap, in metres
  uniform float uMarkDuty;     // dash / period
  uniform float uMarkDashWidth;
  uniform float uMarkSolidWidth;
  #if DASH_COUNT > 0
  uniform float uDashAt[DASH_COUNT];
  uniform float uDashScale[DASH_COUNT];
  #endif
  #if SOLID_COUNT > 0
  uniform float uSolidAt[SOLID_COUNT];
  uniform float uSolidScale[SOLID_COUNT];
  #endif

  // A theme may have NO flowing strips at all - see config/themes.js - and an
  // array declared [0] is not legal GLSL, so the whole block is conditional.
  #if STRIP_COUNT > 0
  uniform float uStripOffset[STRIP_COUNT];
  uniform float uStripWidth[STRIP_COUNT];
  uniform float uStripPeriod[STRIP_COUNT];
  uniform float uStripDuty[STRIP_COUNT];
  uniform float uStripPhase[STRIP_COUNT];
  uniform float uStripIntensity[STRIP_COUNT];
  uniform vec3 uStripColor[STRIP_COUNT];
  uniform float uStripSoftness;
  uniform float uStripGlow;
  uniform float uStripHalo;
  #endif

  varying float vAlong;
  varying float vAcross;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>
  #include <fog_pars_fragment>
  #include <dithering_pars_fragment>

  // Lateral profile of a light line: a tight core plus a much wider soft halo.
  // The halo is what sells "slightly reflective": it reads as the line bleeding
  // into the asphalt the way a neon tube does on wet tarmac.
  vec2 lineProfile(float dist, float width, float glow) {
    float core = 1.0 - smoothstep(width * 0.35, width, dist);
    float halo = 1.0 - smoothstep(width, width * glow, dist);
    return vec2(core, halo);
  }

  // 1 inside [span.x, span.y], falling off over uVergeFade on each side.
  float slab(float x, vec2 span) {
    return smoothstep(span.x - uVergeFade, span.x, x)
      * (1.0 - smoothstep(span.y, span.y + uVergeFade, x));
  }

  // A painted line: a hard edged strip of paint, no halo.
  float paint(float dist, float width) {
    return 1.0 - smoothstep(width * 0.5, width, dist);
  }

  // A ploughed ridge, measured OUTWARD from an edge of the asphalt: full height
  // hard against the edge, falling away over uBankWidth, and nothing at all on
  // the road side of it. d is metres outboard, so a negative d is on the
  // asphalt and contributes zero.
  //
  // NO BACKTICKS ANYWHERE IN THIS FILE. The GLSL is a JS template literal, so a
  // backtick in a comment closes the shader and the build fails somewhere else
  // entirely - the same family of trap as the regex rule in CLAUDE.md.
  //
  // One sided for a reason. The first version centred a symmetric bump ON each
  // edge and then multiplied the whole thing by (1 - paved) to keep it off the
  // road - but paved is 1 at the edge, so every bank was cancelled exactly
  // where it was brightest and only the outboard tail survived. The left side
  // got away with it because the median beside it is unpaved; the right shoulder
  // had nothing but a three metre verge to show in, so it read as a flat green
  // plane lit by the edge line and the neon strip.
  float bankAt(float d) {
    return step(0.0, d) * (1.0 - smoothstep(0.0, uBankWidth, d));
  }

  void main() {
    float across = vAcross;

    // Everything the road emits dies out before the distance at which a chunk
    // is spawned, so a new chunk arrives already dark and cannot pop. The fog
    // is then free to be as thin as the look wants.
    float reach = 1.0 - smoothstep(uNeonFadeStart, uNeonFadeEnd, length(vViewDir));

    // The cross section. Outside every band the ribbon fades to the fog color,
    // so the road has no hard silhouette against the sky at any distance.
    float ours = slab(across, uOurs);
    float oncoming = slab(across, uOncoming);
    float median = slab(across, uMedian);
    float paved = max(ours, oncoming);

    // The ground, then the asphalt over it. Doing it in this order means the
    // verge is ground everywhere the road is not, including between the two
    // carriageways, without a band for every gap.
    vec3 color = mix(uVoidColor, uGroundColor, 1.0 - paved);
    color = mix(color, uAsphaltColor, paved);

    // Ploughed banks: a ridge hard against each edge of each carriageway,
    // falling away OUTWARD, on all four edges. Measured from the paved edges
    // rather than listed, so they follow the layout like everything else.
    float bank =
        bankAt(across - uOurs.y)        // right of our hard shoulder
      + bankAt(uOurs.x - across)        // left of our carriageway, into the median
      + bankAt(across - uOncoming.y)    // right of the oncoming side, into the median
      + bankAt(uOncoming.x - across);   // left of the oncoming shoulder
    color += uBankColor * min(bank, 1.0) * reach;

    color = mix(color, uMedianColor, median * (1.0 - paved));

    // Cheap stand in for a reflection: grazing angles pick up the sky tint.
    vec3 normal = normalize(vNormalView);
    vec3 view = normalize(vViewDir);
    float fresnel = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), uSheenPower);
    color += uSheenColor * fresnel * uSheenStrength * paved * reach;

    // PAINTED MARKINGS, world locked. fract of the along distance, so the dash
    // rhythm belongs to the road rather than to a clock: it cannot drift, and
    // it slows down when the rider does.
    float dashOn = step(fract(vAlong / uMarkPeriod), uMarkDuty);
    float mark = 0.0;
    #if DASH_COUNT > 0
    for (int i = 0; i < DASH_COUNT; i++) {
      mark += paint(abs(across - uDashAt[i]), uMarkDashWidth) * dashOn * uDashScale[i];
    }
    #endif
    #if SOLID_COUNT > 0
    for (int i = 0; i < SOLID_COUNT; i++) {
      mark += paint(abs(across - uSolidAt[i]), uMarkSolidWidth) * uSolidScale[i];
    }
    #endif
    color += uMarkColor * min(mark, 1.0) * uMarkIntensity * reach;

    // Flowing neon strips. Out of the traffic lanes now - the shoulder, both
    // sides of the median and the far verge - which is where peripheral motion
    // belongs; see config/world.js.
    #if STRIP_COUNT > 0
    for (int i = 0; i < STRIP_COUNT; i++) {
      vec2 profile = lineProfile(abs(across - uStripOffset[i]), uStripWidth[i], uStripGlow);

      float phase = fract(vAlong / uStripPeriod[i] - uStripPhase[i]);
      float duty = uStripDuty[i];
      float soft = uStripSoftness * duty;
      float dash = smoothstep(0.0, soft, phase) * (1.0 - smoothstep(duty - soft, duty, phase));

      color += uStripColor[i] * (profile.x + profile.y * uStripHalo) * dash * uStripIntensity[i] * reach;
    }
    #endif

    // Neon edge lines on OUR carriageway: steady, never dashed. Cyan to the
    // left, magenta to the right. across is positive to the RIGHT.
    vec2 leftLine = lineProfile(abs(across + uEdgeAt), uEdgeWidth, uEdgeGlow);
    vec2 rightLine = lineProfile(abs(across - uEdgeAt), uEdgeWidth, uEdgeGlow);
    color += uEdgeLeftColor * (leftLine.x + leftLine.y * uEdgeHalo) * uEdgeIntensity * reach;
    color += uEdgeRightColor * (rightLine.x + rightLine.y * uEdgeHalo) * uEdgeIntensity * reach;

    // The far carriageway steps back, everything on it together - asphalt,
    // paint and the headlights' own road. Applied last so nothing has to
    // remember to dim itself.
    color *= mix(1.0, uOncomingDim, oncoming);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    // Fog last, and after the color space conversion: three uploads fogColor in
    // the output color space, which is the convention every built in material
    // follows. Moving it earlier would tint the whole horizon.
    #include <fog_fragment>
    #include <dithering_fragment>
  }
`,Ud=class{constructor(){let e=$.world.road,t=e.strips,n=t.lanes,r=e.markings,i=Fd();this._offsets=new Float64Array(n.length),this._periods=new Float64Array(n.length);let a=[],o=[],s=[],c=[],l=[],u=[],d=[];for(let e=0;e<n.length;e++){let r=n[e],f=t.patternLength/r.repeats;this._offsets[e]=0,this._periods[e]=f,a.push(Id(i,r.anchor)+r.inset),o.push(r.width),s.push(f),c.push(r.duty),l.push(0),u.push(r.intensity),d.push(new J(r.color))}let f=[],p=[],m=[],h=[];for(let e of i.laneEdges)f.push(e),p.push(1);m.push(i.left,i.right),h.push(1,1);let g=r.oncomingScale,_=i.laneWidth;for(let e=1;e<i.oncomingCentres.length;e++)f.push(i.oncomingInner-_*e),p.push(g);m.push(i.oncomingInner,i.oncomingOuter),h.push(g,g);let v=$.world.road.carriageway.shoulderRight,y=ua.clone(Q.fog);this.material=new pa({defines:{STRIP_COUNT:n.length,DASH_COUNT:f.length,SOLID_COUNT:m.length},uniforms:Object.assign(y,{uAsphaltColor:{value:new J(e.surface.asphaltColor)},uVoidColor:{value:new J(e.surface.voidColor)},uMedianColor:{value:new J(e.surface.medianColor)},uOurs:{value:new U(i.left,i.shoulderEdge)},uMedian:{value:new U(i.medianOuter,i.medianInner)},uOncoming:{value:new U(i.oncomingOuter-v,i.oncomingInner)},uVergeFade:{value:e.carriageway.verge},uOncomingDim:{value:e.surface.oncomingDim},uGroundColor:{value:new J(e.surface.groundColor)},uBankColor:{value:new J(e.surface.bankColor)},uBankWidth:{value:e.surface.bankWidth},uSheenColor:{value:new J(e.surface.sheenColor)},uSheenStrength:{value:e.surface.sheenStrength},uSheenPower:{value:e.surface.sheenPower},uNeonFadeStart:{value:e.surface.neonFadeStart},uNeonFadeEnd:{value:e.surface.neonFadeEnd},uEdgeLeftColor:{value:new J(e.edges.leftColor)},uEdgeRightColor:{value:new J(e.edges.rightColor)},uEdgeAt:{value:i.right},uEdgeWidth:{value:e.edges.width},uEdgeGlow:{value:e.edges.glow},uEdgeIntensity:{value:e.edges.intensity},uEdgeHalo:{value:e.edges.halo},uMarkColor:{value:new J(r.color)},uMarkIntensity:{value:r.intensity},uMarkPeriod:{value:r.dash+r.gap},uMarkDuty:{value:r.dash/(r.dash+r.gap)},uMarkDashWidth:{value:r.laneWidth},uMarkSolidWidth:{value:r.edgeWidth},uDashAt:{value:f},uDashScale:{value:p},uSolidAt:{value:m},uSolidScale:{value:h},uStripOffset:{value:a},uStripWidth:{value:o},uStripPeriod:{value:s},uStripDuty:{value:c},uStripPhase:{value:l},uStripIntensity:{value:u},uStripColor:{value:d},uStripSoftness:{value:t.softness},uStripGlow:{value:t.glow},uStripHalo:{value:t.halo}}),vertexShader:Vd,fragmentShader:Hd,fog:!0,dithering:!0}),this.material.name=`RoadSurface`,this._phase=l}applyTheme(){let e=$.world.road,t=e.markings,n=e.strips,r=this.material.uniforms;r.uAsphaltColor.value.set(e.surface.asphaltColor),r.uVoidColor.value.set(e.surface.voidColor),r.uMedianColor.value.set(e.surface.medianColor),r.uOncomingDim.value=e.surface.oncomingDim,r.uGroundColor.value.set(e.surface.groundColor),r.uBankColor.value.set(e.surface.bankColor),r.uBankWidth.value=e.surface.bankWidth,r.uSheenColor.value.set(e.surface.sheenColor),r.uSheenStrength.value=e.surface.sheenStrength,r.uSheenPower.value=e.surface.sheenPower,r.uNeonFadeStart.value=e.surface.neonFadeStart,r.uNeonFadeEnd.value=e.surface.neonFadeEnd,r.uEdgeLeftColor.value.set(e.edges.leftColor),r.uEdgeRightColor.value.set(e.edges.rightColor),r.uEdgeWidth.value=e.edges.width,r.uEdgeGlow.value=e.edges.glow,r.uEdgeIntensity.value=e.edges.intensity,r.uEdgeHalo.value=e.edges.halo,r.uMarkColor.value.set(t.color),r.uMarkIntensity.value=t.intensity,r.uStripSoftness.value=n.softness,r.uStripGlow.value=n.glow,r.uStripHalo.value=n.halo;let i=n.lanes;for(let e=0;e<r.uStripColor.value.length&&e<i.length;e++)r.uStripColor.value[e].set(i[e].color),r.uStripIntensity.value[e]=i[e].intensity}update(e,t=0){let n=$.world.road.strips,r=n.lanes,i=du(`stripScroll`),a=n.scrollFromSpeed*t*i;for(let t=0;t<r.length;t++){let n=this._periods[t],o=this._offsets[t]+(r[t].speed*i+a)*e;o-=Math.floor(o/n)*n,this._offsets[t]=o,this._phase[t]=o/n}this.material.uniformsNeedUpdate=!0}dispose(){this.material.dispose()}},Wd=class{constructor(e){let t=$.world.road;this.scene=e,this.chunkLength=t.chunkLength,this.poolSize=t.poolSize,this.chunksBehind=t.chunksBehind,this.group=new Cn,this.group.name=`Road`,e.add(this.group),this.path=new Pd,this.surface=new Ud,this.firstChunkIndex=0,this._chunkListeners=[],this.chunks=[];for(let e=0;e<this.poolSize;e++){let e=new Bd(this.surface.material);this.chunks.push(e),this.group.add(e.mesh)}for(let e=0;e<this.poolSize;e++)this.chunks[e].rebuild(this.path,e)}onChunkBuilt(e){this._chunkListeners.push(e);for(let t=0;t<this.poolSize;t++)e(t,this.chunks[t].chunkIndex)}update(e,t){this.surface.update(e,t.speed||0);let n=Math.floor((t.distance||0)/this.chunkLength)-this.chunksBehind;for(;this.firstChunkIndex<n;){let e=this.firstChunkIndex%this.poolSize,t=this.firstChunkIndex+this.poolSize;this.chunks[e].rebuild(this.path,t),this.firstChunkIndex++;for(let n=0;n<this._chunkListeners.length;n++)this._chunkListeners[n](e,t)}}dispose(){for(let e=0;e<this.chunks.length;e++)this.chunks[e].dispose();this.chunks.length=0,this._chunkListeners.length=0,this.surface.dispose(),this.scene.remove(this.group),this.group.clear(),this.scene=null}},Gd=`distance-fade`;function Kd(e,t,n){e.onBeforeCompile=e=>{e.uniforms.uFadeStart={value:t},e.uniforms.uFadeEnd={value:n},e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying float vFadeDepth;`).replace(`#include <fog_vertex>`,`#include <fog_vertex>
vFadeDepth = -mvPosition.z;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uFadeStart;
uniform float uFadeEnd;
varying float vFadeDepth;`).replace(`#include <color_fragment>`,`#include <color_fragment>
diffuseColor.rgb *= 1.0 - smoothstep(uFadeStart, uFadeEnd, vFadeDepth);`)},e.customProgramCacheKey=()=>Gd}var qd=new W;function Jd(e,t){if(!Array.isArray(e)||e.length<3)throw Error(t+` wants a plain [x, y, z]; got `+(e&&e.isVector3?`a Vector3 - call .toArray()`:typeof e));for(let n=0;n<3;n++)if(!Number.isFinite(e[n]))throw Error(t+` has a non-finite component: [`+e.join(`, `)+`]`)}function Yd(e,t){let n=e.attributes.position;if(!n||n.count===0)throw Error(`geometry "`+t+`" has no vertices`);let r=n.array;for(let e=0;e<r.length;e++)if(!Number.isFinite(r[e]))throw Error(`geometry "`+t+`" has a non-finite coordinate at index `+e+`. The usual cause is a helper given a Vector3 where it wanted [x, y, z].`);if(e.computeBoundingBox(),e.boundingBox.getSize(qd),!Number.isFinite(qd.x+qd.y+qd.z))throw Error(`geometry "`+t+`" has a non-finite bounding box`);if(qd.x<=0||qd.y<=0||qd.z<=0)throw Error(`geometry "`+t+`" is flat: extent `+qd.toArray().map(e=>e.toFixed(6)).join(` x `))}var Xd=class{constructor(){this._parts=[],this._vertexCount=0,this._indexCount=0}get isEmpty(){return this._parts.length===0}add(e,t){if(t&&e.applyMatrix4(t),e.index===null){let t=e.attributes.position.count,n=t>65535?new Uint32Array(t):new Uint16Array(t);for(let e=0;e<t;e++)n[e]=e;e.setIndex(new Y(n,1))}if(t&&t.determinant()<0){let t=e.index.array;for(let e=0;e<t.length;e+=3){let n=t[e];t[e]=t[e+2],t[e+2]=n}}return this._parts.push(e),this._vertexCount+=e.attributes.position.count,this._indexCount+=e.index.count,this}build(e=`merged`,t){let n=new Float32Array(this._vertexCount*3),r=new Float32Array(this._vertexCount*3),i=new Float32Array(this._vertexCount*2),a=!1;for(let e=0;e<this._parts.length;e++)if(this._parts[e].attributes.color){a=!0;break}let o=a?new Float32Array(this._vertexCount*3):null,s=this._vertexCount>65535?new Uint32Array(this._indexCount):new Uint16Array(this._indexCount),c=0,l=0;for(let e=0;e<this._parts.length;e++){let t=this._parts[e],a=t.attributes.position,u=t.attributes.normal,d=t.attributes.uv,f=t.index;if(n.set(a.array,c*3),u&&r.set(u.array,c*3),d&&i.set(d.array,c*2),o){let e=t.attributes.color;e?o.set(e.array,c*3):o.fill(1,c*3,(c+a.count)*3)}for(let e=0;e<f.count;e++)s[l+e]=f.array[e]+c;c+=a.count,l+=f.count,t.dispose()}this._parts.length=0;let u=new Tr;return u.name=e,u.setAttribute(`position`,new Y(n,3)),u.setAttribute(`normal`,new Y(r,3)),u.setAttribute(`uv`,new Y(i,2)),o&&u.setAttribute(`color`,new Y(o,3)),u.setIndex(new Y(s,1)),u.computeBoundingSphere(),t&&t.flat||Yd(u,e),u}},Zd=new W,Qd=new W,$d=new W,ef=new q,tf=new Dt,nf=new W(1,1,1),rf=new W,af=new W(0,1,0),of=new an;function sf(e,t,n,r,i,a=r){Jd(t,`addTube from`),Jd(n,`addTube to`),Zd.fromArray(t),Qd.fromArray(n),$d.copy(Qd).sub(Zd);let o=$d.length();o!==0&&($d.divideScalar(o),tf.setFromUnitVectors(af,$d),rf.copy(Zd).addScaledVector($d,o*.5),ef.compose(rf,tf,nf),e.add(new Ui(a,r,o,i,1),ef))}function cf(e,t,n,r=new q){let i=n?n[0]:0,a=n?n[1]:0,o=n?n[2]:0;return rf.set(t[0]*e,t[1],t[2]),tf.setFromEuler(of.set(i,a*e,o*e,`XYZ`)),r.compose(rf,tf,nf)}function lf(e,t,n=new q){return $d.fromArray(t).normalize(),tf.setFromUnitVectors(af,$d),rf.fromArray(e),n.compose(rf,tf,nf)}function uf(e,t){let n=[];for(let t=0;t<e.length;t++)n.push(new U(e[t][0],e[t][1]));return new ta(n,t)}function df(e,t){let n=e.attributes.position.count,r=new Float32Array(n*3);if(typeof t==`number`&&t<=1)r.fill(t);else{let e=new J(t);for(let t=0;t<n;t++)r[t*3]=e.r,r[t*3+1]=e.g,r[t*3+2]=e.b}e.setAttribute(`color`,new Y(r,3))}var ff=new W,pf=new W,mf=new W,hf=new W,gf=new J;function _f(){let e=$.world.roadside.stationsPerChunk;for(let t of Object.values($.themes)){let n=t&&t.world&&t.world.roadside&&t.world.roadside.stationsPerChunk;typeof n==`number`&&n>e&&(e=n)}return e}var vf=new q,yf=new J,bf=class e{constructor(t,n){let r=$.world.roadside,i=$.world.road;this.scene=t,this.road=n,this.maxStations=_f(),this.stationsPerChunk=Math.min(r.stationsPerChunk,this.maxStations),this.perChunk=this.maxStations*2;let a=Fd();this.offsetRight=a.shoulderEdge+r.verge,this.offsetLeft=-(a.oncomingOuter-$.world.road.carriageway.shoulderRight-r.verge);let o=i.poolSize*this.perChunk;this.group=new Cn,this.group.name=`Roadside`,t.add(this.group),this.postGeometry=e._buildPost(r),this.tubeGeometry=new X(r.tubeWidth,r.tubeHeight,r.tubeDepth),this.postMaterial=new ni({color:r.postColor}),this.tubeMaterial=new ni({color:16777215}),Kd(this.postMaterial,i.surface.neonFadeStart,i.surface.neonFadeEnd),Kd(this.tubeMaterial,i.surface.neonFadeStart,i.surface.neonFadeEnd),this.posts=new Ei(this.postGeometry,this.postMaterial,o),this.tubes=new Ei(this.tubeGeometry,this.tubeMaterial,o);for(let e of[this.posts,this.tubes])e.instanceMatrix.setUsage(He),e.frustumCulled=!1,this.group.add(e);for(let e=0;e<o;e++)yf.set(e%2==0?r.rightColor:r.leftColor),this.tubes.setColorAt(e,yf);this.tubes.instanceColor.needsUpdate=!0,this._onChunkBuilt=this._fillChunk.bind(this),n.onChunkBuilt(this._onChunkBuilt)}static _buildPost(e){let t=new Xd,n=new q;return t.add(new X(e.postWidth,e.postHeight,e.postDepth),n.identity()),t.add(new X(e.baseWidth,e.baseHeight,e.baseWidth),n.makeTranslation(0,-e.postHeight*.5+e.baseHeight*.5,0)),t.build(`roadside-post`)}_fillChunk(e,t){let n=$.world.roadside,r=this.road.path,i=e*this.perChunk,a=this.stationsPerChunk,o=$.world.road.chunkLength/a,s=t*a;for(let e=0;e<this.maxStations;e++){if(e>=a){vf.makeScale(0,0,0);for(let t=0;t<2;t++){let n=i+e*2+t;this.posts.setMatrixAt(n,vf),this.tubes.setMatrixAt(n,vf)}continue}let t=(s+e+.5)*o;r.frameAt(t,ff,pf,mf),hf.crossVectors(mf,Od),vf.makeBasis(mf,Od,hf);for(let t=0;t<2;t++){let r=t===0?1:-1,a=i+e*2+t,o=r>0?this.offsetRight:this.offsetLeft;vf.setPosition(ff.x+mf.x*r*o,ff.y+n.postHeight*.5,ff.z+mf.z*r*o),this.posts.setMatrixAt(a,vf);let s=r*(o-n.tubeInset);vf.setPosition(ff.x+mf.x*s,ff.y+n.tubeLift+n.tubeHeight*.5,ff.z+mf.z*s),this.tubes.setMatrixAt(a,vf)}}this.posts.instanceMatrix.needsUpdate=!0,this.tubes.instanceMatrix.needsUpdate=!0}applyTheme(){let e=$.world.roadside,t=this.tubes.count;for(let n=0;n<t;n++)gf.set(n%2==0?e.rightColor:e.leftColor),this.tubes.setColorAt(n,gf);this.tubes.instanceColor&&(this.tubes.instanceColor.needsUpdate=!0),this.setStations(e.stationsPerChunk)}setStations(e){let t=Math.max(1,Math.min(Math.round(e),this.maxStations));t!==this.stationsPerChunk&&(this.stationsPerChunk=t,this.refill())}refill(){let e=this.road.chunks;for(let t=0;t<e.length;t++)this._fillChunk(t,e[t].chunkIndex)}dispose(){this.postGeometry.dispose(),this.tubeGeometry.dispose(),this.postMaterial.dispose(),this.tubeMaterial.dispose(),this.posts.dispose(),this.tubes.dispose(),this.scene.remove(this.group),this.group.clear(),this.scene=null,this.road=null}},xf=new J,Sf=new J,Cf=class{constructor(e){let t=$.world.mountains;this.scene=e,this.slabLength=t.slabLength,this.columns=t.columns,this.group=new Cn,this.group.name=`Mountains`,this.group.visible=t.enabled!==!1,e.add(this.group);let n=zu($.world.seed+977);this._fbm=ad(id(n),t.ridge),this.material=new ni({vertexColors:!0,side:2}),this.material.name=`MountainRidge`,this.slabs=[];for(let e=0;e<t.layers.length;e++){let n=Object.assign({index:e},t.layers[e]);for(let r=0;r<2;r++){let i=r===0?1:-1,a=e*100+r*50+13;for(let e=0;e<t.slabsPerLayer;e++){let t=this._createSlab(n,i,a);t.start=(e-1)*this.slabLength,this._fillSlab(t),this.slabs.push(t),this.group.add(t.mesh)}}}}_createSlab(e,t,n){$.world.mountains;let r=this.columns,i=(r+1)*2,a=new Float32Array(i*3),o=new Float32Array(i*3);for(let t=0;t<=r;t++)xf.set(e.color),o[t*6]=xf.r,o[t*6+1]=xf.g,o[t*6+2]=xf.b,xf.set($.world.fog.color),o[t*6+3]=xf.r,o[t*6+4]=xf.g,o[t*6+5]=xf.b;let s=new Uint16Array(r*6),c=0;for(let e=0;e<r;e++){let t=e*2,n=t+1;s[c++]=t,s[c++]=n,s[c++]=t+2,s[c++]=n,s[c++]=n+2,s[c++]=t+2}let l=new Tr,u=new Y(a,3);u.setUsage(He),l.setAttribute(`position`,u),l.setAttribute(`color`,new Y(o,3)),l.setIndex(new Y(s,1));let d=new mi(l,this.material);return d.name=`MountainSlab`,d.position.x=t*e.distance,{mesh:d,positions:a,colors:o,lane:n,start:0,sign:t,layerIndex:e.index,height:e.height,floor:e.floor}}applyTheme(){let e=$.world.mountains;this.group.visible=e.enabled!==!1,Sf.set($.world.fog.color);for(let t=0;t<this.slabs.length;t++){let n=this.slabs[t],r=e.layers[n.layerIndex];if(!r)continue;n.height=r.height,n.floor=r.floor,n.mesh.position.x=n.sign*r.distance,xf.set(r.color);let i=n.colors;for(let e=0;e<i.length;e+=6)i[e]=xf.r,i[e+1]=xf.g,i[e+2]=xf.b,i[e+3]=Sf.r,i[e+4]=Sf.g,i[e+5]=Sf.b;n.mesh.geometry.attributes.color.needsUpdate=!0,this._fillSlab(n)}}_fillSlab(e){let t=$.world.mountains,n=this.columns,r=this.slabLength/n,i=e.positions;e.mesh.position.z=-e.start;for(let a=0;a<=n;a++){let n=e.start+a*r,o=this._fbm(n/t.ridge.wavelength,e.lane),s=(1-Math.abs(o))*(1-Math.abs(o)),c=e.height*(e.floor+(1-e.floor)*s),l=this._fbm(n/(t.ridge.wavelength*2.7),e.lane+7)*t.depthJitter,u=a*6;i[u]=l,i[u+1]=c,i[u+2]=-a*r,i[u+3]=l,i[u+4]=t.baseY,i[u+5]=-a*r}e.mesh.geometry.attributes.position.needsUpdate=!0,e.mesh.geometry.computeBoundingSphere()}update(e,t){let n=t.distance||0,r=this.slabLength*$.world.mountains.slabsPerLayer;for(let e=0;e<this.slabs.length;e++){let t=this.slabs[e];for(;n>t.start+this.slabLength;)t.start+=r,this._fillSlab(t)}}dispose(){for(let e=0;e<this.slabs.length;e++)this.slabs[e].mesh.geometry.dispose();this.slabs.length=0,this.material.dispose(),this.scene.remove(this.group),this.group.clear(),this.scene=null}},wf=new W,Tf=new W,Ef=new W,Df=new W,Of=new W,kf=new q,Af=class{constructor(e,t){let n=$.world.median,r=$.world.road;this.scene=e,this.road=t,this.enabled=n.enabled,this.perChunk=n.segmentsPerChunk,this.spacing=r.chunkLength/n.segmentsPerChunk,this.at=Fd().medianCentre,this.group=new Cn,this.group.name=`Median`,e.add(this.group);let i=r.poolSize*this.perChunk,a=this.spacing+n.overlap;this.wallGeometry=new X(n.width,n.height,a),this.capGeometry=new X(1,1,a),this.wallMaterial=new ni({color:n.color}),this.capMaterial=new ni({color:n.capColor,toneMapped:!1}),Kd(this.wallMaterial,r.surface.neonFadeStart,r.surface.neonFadeEnd),Kd(this.capMaterial,r.surface.neonFadeStart,r.surface.neonFadeEnd),this.wall=new Ei(this.wallGeometry,this.wallMaterial,i),this.cap=new Ei(this.capGeometry,this.capMaterial,i);for(let e of[this.wall,this.cap])e.instanceMatrix.setUsage(He),e.frustumCulled=!1,e.visible=this.enabled,this.group.add(e);this._onChunkBuilt=this._fillChunk.bind(this),t.onChunkBuilt(this._onChunkBuilt)}_fillChunk(e,t){if(!this.enabled)return;let n=$.world.median,r=this.road.path,i=e*this.perChunk,a=t*this.perChunk;for(let e=0;e<this.perChunk;e++){let t=(a+e+.5)*this.spacing;r.frameAt(t,wf,Tf,Ef),Df.crossVectors(Ef,Od),kf.makeBasis(Ef,Od,Df);let o=wf.x+Ef.x*this.at,s=wf.z+Ef.z*this.at;kf.setPosition(o,wf.y+n.height*.5,s),this.wall.setMatrixAt(i+e,kf),kf.scale(Of.set(n.capWidth,n.capHeight,1)),kf.setPosition(o,wf.y+n.height+n.capHeight*.5,s),this.cap.setMatrixAt(i+e,kf)}this.wall.instanceMatrix.needsUpdate=!0,this.cap.instanceMatrix.needsUpdate=!0}applyTheme(){let e=$.world.median;this.wallMaterial.color.set(e.color),this.capMaterial.color.set(e.capColor),this.refill()}refill(){let e=this.road.chunks;for(let t=0;t<e.length;t++)this._fillChunk(t,e[t].chunkIndex)}dispose(){this.wallGeometry.dispose(),this.capGeometry.dispose(),this.wallMaterial.dispose(),this.capMaterial.dispose(),this.wall.dispose(),this.cap.dispose(),this.scene.remove(this.group),this.group.clear(),this.scene=null,this.road=null}};function jf(e){let t=e.textureSize,n=document.createElement(`canvas`);n.width=t,n.height=t;let r=n.getContext(`2d`),i=t/2;r.clearRect(0,0,t,t);let a=(t,n,a)=>{let o=t*i,s=n*i,c=i*.08;r.save(),r.translate(o,s),r.fillStyle=e.plateColor,r.fillRect(c,c,i-c*2,i-c*2),r.strokeStyle=e.borderColor,r.lineWidth=i*.035,r.strokeRect(c,c,i-c*2,i-c*2),r.textAlign=`center`,r.textBaseline=`middle`,a(i),r.restore()},o=(e,t,n,a)=>{r.fillStyle=a,r.font=`700 `+Math.round(i*n)+`px system-ui, sans-serif`,r.fillText(e,i/2,t)};a(0,0,t=>{o(`NEON`,t*.38,.22,e.textColor),o(`RIDE`,t*.64,.22,e.textColor)}),a(1,0,t=>{o(`1`,t*.36,.3,e.textColor),o(`KM`,t*.66,.18,e.textColor)}),a(0,1,t=>{let n=t/2,i=t/2;r.fillStyle=e.textColor,r.beginPath(),r.moveTo(n,i-t*.22),r.lineTo(n+t*.18,i+t*.02),r.lineTo(n+t*.07,i+t*.02),r.lineTo(n+t*.07,i+t*.22),r.lineTo(n-t*.07,i+t*.22),r.lineTo(n-t*.07,i+t*.02),r.lineTo(n-t*.18,i+t*.02),r.closePath(),r.fill()}),a(1,1,t=>{o(`500`,t*.38,.22,e.textColor),o(`M`,t*.66,.2,e.textColor)});let s=new zi(n);return s.name=`sign-atlas`,s.colorSpace=Le,s}function Mf(e,t,n){let r=e.attributes.uv;for(let e=0;e<r.count;e++)r.setXY(e,r.getX(e)*.5+t*.5,r.getY(e)*.5+(1-n)*.5);return r.needsUpdate=!0,e}var Nf=new q;function Pf(e,t){return df(e,t),e}function Ff(e,t,n,r){let i=e.attributes.position,a=new Float32Array(i.count*3),o=new J(n),s=new J(r);for(let e=0;e<i.count;e++){let n=i.getY(e)>=t?o:s;a[e*3]=n.r,a[e*3+1]=n.g,a[e*3+2]=n.b}return e.setAttribute(`color`,new Y(a,3)),e}function If(e){let t=new Xd,n=e.sides,r=e.tiers;t.add(Pf(new Ui(e.trunkRadius,e.trunkRadius*1.3,e.trunkHeight,n),e.trunkColor),Nf.makeTranslation(0,e.trunkHeight*.5,0));let i=e.trunkHeight;for(let a=0;a<r;a++){let o=a/Math.max(1,r-1),s=e.radius*(1-o*e.taper),c=e.height/r*(1+e.spire*o),l=new Wi(s,c,n,2);Ff(l,-c*.5+c*e.snowLine,e.snowColor,e.needleColor),t.add(l,Nf.makeTranslation(0,i+c*.5,0)),i+=c*e.overlap}return t.build(`prop-pine`)}function Lf(e){let t=new ea(e.radius,0);return t.scale(1,e.squash,1.15),t.translate(0,e.radius*e.squash*.75,0),Pf(t,e.color)}function Rf(e,t){let n=new Xd;n.add(Pf(new X(e.postWidth,e.height,e.postWidth),e.postColor),Nf.makeTranslation(0,e.height*.5,0));let r=new X(e.armLength,e.postWidth*.7,e.postWidth*.7);return n.add(Pf(r,e.postColor),Nf.makeTranslation(t*e.armLength*.5,e.height-e.postWidth*.5,0)),n.add(Pf(new X(e.headLength,e.headHeight,e.headWidth),e.headColor),Nf.makeTranslation(t*e.armLength,e.height-e.postWidth*.5-e.headHeight*.5,0)),n.build(`prop-lamp`)}function zf(e,t){let n=new Xd,r=e.glow,i=new na(r.size,r.size*r.stretch);i.rotateX(-Math.PI/2),n.add(Pf(i,r.color),Nf.makeTranslation(t*e.armLength,r.lift,0));let a=new na(r.haloSize,r.haloSize);return n.add(Pf(a,r.color),Nf.makeTranslation(t*e.armLength,e.height-e.postWidth*.5-e.headHeight*.5,0)),n.build(`prop-lamp-glow`)}function Bf(e){let t=new Xd,n=e.span;for(let r of[-1,1])t.add(Pf(new X(e.legWidth,e.height,e.legWidth),e.legColor),Nf.makeTranslation(r*n*.5,e.height*.5,0)),t.add(Pf(new X(e.legWidth*2.6,e.footHeight,e.legWidth*2.6),e.legColor),Nf.makeTranslation(r*n*.5,e.footHeight*.5,0));return t.add(Pf(new X(n,e.beamHeight,e.beamDepth),e.legColor),Nf.makeTranslation(0,e.height,0)),t.build(`prop-gantry`)}function Vf(e){let t=new Xd,n=e.glow.panel,r=e.height-e.beamHeight*.5-n.size*.5,i=n.cells;for(let a=0;a<i.length;a++){let o=new na(n.size,n.size);Mf(o,i[a][0],i[a][1]),df(o,n.color);let s=(a-(i.length-1)/2)*(n.size+n.gap);t.add(o,Nf.makeTranslation(s,r,e.beamDepth*.5+.03))}return t.build(`prop-gantry-glow`,{flat:!0})}var Hf={lampLeft:e=>zf(e,1),lampRight:e=>zf(e,-1),gantry:e=>Vf(e)},Uf={pine:e=>If(e),rock:e=>Lf(e),gantry:e=>Bf(e),lampLeft:e=>Rf(e,1),lampRight:e=>Rf(e,-1)},Wf=new W,Gf=new W,Kf=new W,qf=new W,Jf=new q,Yf=new W,Xf=1e6,Zf=class{constructor(e,t){let n=$.world.scenery,r=$.world.road;this.scene=e,this.road=t,this.layout=Fd(),this.group=new Cn,this.group.name=`Scenery`,e.add(this.group),this.kinds=[];for(let[e,t]of Object.entries(n.kinds)){let n=Uf[t.shape];if(!n)continue;let i=n(t),a=new ni({vertexColors:!0,toneMapped:t.toneMapped!==!1});Kd(a,r.surface.neonFadeStart,r.surface.neonFadeEnd);let o=t.perChunk,s=r.poolSize*o,c=new Ei(i,a,s);c.name=`Scenery_`+e,c.instanceMatrix.setUsage(He),c.frustumCulled=!1,this.group.add(c);let l=null,u=t.glow&&Hf[t.shape];if(u){let n;t.glow.sign?(this.signTexture=this.signTexture||jf(t.glow.sign),n=this.signTexture):(this.glowTexture=this.glowTexture||fd(t.glow.texture,t.glow.textureSize),n=this.glowTexture);let i=u(t),a=new ni({map:n,vertexColors:!0,transparent:!0,blending:2,depthWrite:!1,toneMapped:!1,opacity:t.glow.opacity});Kd(a,r.surface.neonFadeStart,r.surface.neonFadeEnd),l=new Ei(i,a,s),l.name=`SceneryGlow_`+e,l.instanceMatrix.setUsage(He),l.frustumCulled=!1,l.renderOrder=2,this.group.add(l),this._extra=this._extra||[],this._extra.push({geometry:i,material:a,mesh:l})}this.kinds.push({name:e,cfg:t,mesh:c,glow:l,geometry:i,material:a,perChunk:o,salt:this.kinds.length*104729})}this._onChunkBuilt=this._fillChunk.bind(this),t.onChunkBuilt(this._onChunkBuilt)}refill(){for(let e=0;e<this.road.chunks.length;e++)this._fillChunk(e,this.road.chunks[e].chunkIndex)}_fillChunk(e,t){let n=this.road.path,r=$.world.road.chunkLength,i=$.world.scenery.density;for(let a of this.kinds){let o=a.cfg,s=e*a.perChunk,c=Math.max(0,Math.min(1,i[a.name]||0)),l=Math.round(a.perChunk*c);if(a.mesh.visible=l>0,a.glow&&(a.glow.visible=l>0),l===0)continue;let u=zu($.world.scenery.seed+t*7919+a.salt);for(let e=0;e<a.perChunk;e++){if(e>=l){Jf.makeTranslation(Xf,Xf,Xf),a.mesh.setMatrixAt(s+e,Jf),a.glow&&a.glow.setMatrixAt(s+e,Jf);continue}let i=(t+(e+u.next())/a.perChunk)*r;n.frameAt(i,Wf,Gf,Kf);let c=0;if(o.side!==`centre`){let e=o.side===`both`?u.next()<.5?1:-1:o.side===`right`?1:-1;c=e*((e>0?this.layout.ribbonRight:-this.layout.ribbonLeft)+o.setback+u.next()*o.spread)}qf.crossVectors(Kf,Od),Jf.makeBasis(Kf,Od,qf);let d=o.scaleMin+u.next()*(o.scaleMax-o.scaleMin);Yf.set(d,d,d),Jf.scale(Yf),Jf.setPosition(Wf.x+Kf.x*c,Wf.y+(o.sink||0),Wf.z+Kf.z*c),a.mesh.setMatrixAt(s+e,Jf),a.glow&&a.glow.setMatrixAt(s+e,Jf)}a.mesh.instanceMatrix.needsUpdate=!0,a.glow&&(a.glow.instanceMatrix.needsUpdate=!0)}}dispose(){for(let e of this.kinds)e.geometry.dispose(),e.material.dispose(),e.mesh.dispose();for(let e of this._extra||[])e.geometry.dispose(),e.material.dispose(),e.mesh.dispose();this.glowTexture&&this.glowTexture.dispose(),this.signTexture&&this.signTexture.dispose(),this.kinds.length=0,this.scene.remove(this.group),this.group.clear(),this.scene=null,this.road=null}},Qf=new W,$f=new W,ep=new U,tp=`
  attribute vec3 aVelocity;

  uniform float uSize;
  uniform float uPixelsPerUnit;
  uniform float uStreak;
  uniform vec3 uFlow;

  varying vec2 vDir;
  varying float vStretch;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depth = max(0.1, -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // A flake's true motion through the world is its own fall plus the flow the
    // bike drags it through. Both, or a stopped bike would still show streaks
    // and a moving one would show them falling straight down.
    vec3 motion = aVelocity + uFlow;

    // Where that motion points ON SCREEN. Projecting the far end of it and
    // taking the difference in clip space is the only way to get this right
    // through a perspective divide.
    vec4 tip = projectionMatrix * (mvPosition + viewMatrix * vec4(motion, 0.0));
    vec2 here = gl_Position.xy / max(0.0001, abs(gl_Position.w));
    vec2 there = tip.xy / max(0.0001, abs(tip.w));
    vec2 delta = there - here;
    float len = length(delta);
    vDir = len > 0.0001 ? delta / len : vec2(0.0, 1.0);

    // How far it smears. Bounded, because a streak longer than the sprite it
    // is drawn in simply clips, and because a flake that becomes a line has
    // stopped being a flake.
    vStretch = 1.0 + uStreak;

    gl_PointSize = uSize * uPixelsPerUnit * vStretch / depth;
  }
`,np=`
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vDir;
  varying float vStretch;

  void main() {
    // Point coordinates run 0..1 with y DOWN, and the streak direction was
    // computed in clip space with y up, so one of them has to be flipped or
    // every flake leans the wrong way.
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    uv.y = -uv.y;

    // Measure the distance in the flake's own frame: along its motion, and
    // across it.
    //
    // THE SPRITE GROWS IN BOTH AXES AND THE FLAKE MUST NOT. gl_PointSize is a
    // square, so stretching a streak means asking for a bigger square - and uv
    // then spans that bigger square in both directions. Dividing the ALONG
    // axis by the stretch made the ellipse long, and left it just as wide,
    // which drew snow as fat white blocks. The across axis is MULTIPLIED
    // instead: the sprite grew by vStretch, so the flake's width in uv has to
    // shrink by the same factor to stay the width it was.
    vec2 across = vec2(-vDir.y, vDir.x);
    float a = dot(uv, vDir);
    float b = dot(uv, across) * vStretch;
    float d = length(vec2(a, b));

    // Soft all the way out. A hard edge on a small sprite aliases into a
    // sparkle, which reads as dust rather than as snow.
    float alpha = 1.0 - smoothstep(0.15, 1.0, d);
    if (alpha <= 0.002) discard;

    gl_FragColor = vec4(uColor, alpha * uOpacity);
  }
`,rp=class{constructor(e,t,n){let r=$.world.weather;this.scene=e,this.camera=t,this.renderer=n,this.rng=zu(r.seed),this.count=r.count,this.box=r.box,this._points=new Float32Array(this.count*3),this._velocity=new Float32Array(this.count*3);let i={x:this.box[0]*.5,y:this.box[1]*.5,z:this.box[2]*.5};this._half=i;for(let e=0;e<this.count;e++)this._points[e*3]=(this.rng.next()*2-1)*i.x,this._points[e*3+1]=(this.rng.next()*2-1)*i.y,this._points[e*3+2]=(this.rng.next()*2-1)*i.z;this.geometry=new Tr;let a=new Y(this._points,3);a.setUsage(He),this.geometry.setAttribute(`position`,a),this.geometry.setAttribute(`aVelocity`,new Y(this._velocity,3)),this.material=new pa({uniforms:{uSize:{value:.2},uPixelsPerUnit:{value:500},uStreak:{value:0},uFlow:{value:new W},uColor:{value:new J(16777215)},uOpacity:{value:1}},vertexShader:tp,fragmentShader:np,transparent:!0,depthWrite:!1,blending:1}),this.flakes=new Ii(this.geometry,this.material),this.flakes.name=`Weather`,this.flakes.frustumCulled=!1,this.flakes.renderOrder=5,this.flakes.visible=!1,e.add(this.flakes),this.kind=null,this.setKind(r.kind)}setKind(e){this.fade===void 0&&(this.fade=1);let t=e&&$.world.weather.kinds[e];if(this.kind=t?e:null,this.preset=t||null,this.flakes.visible=!!t,this.fade=+!!t,t){this.material.uniforms.uColor.value.set(t.color),this.material.uniforms.uOpacity.value=t.opacity*this.fade,this.material.uniforms.uSize.value=t.size;for(let e=0;e<this.count;e++){let n=e*3;this._velocity[n]=t.drift[0]*(this.rng.next()*2-1),this._velocity[n+1]=-t.fall*(.6+this.rng.next()*.8),this._velocity[n+2]=t.drift[1]*(this.rng.next()*2-1)}this.geometry.attributes.aVelocity.needsUpdate=!0}}setFade(e){this.fade=Math.max(0,Math.min(1,e)),this.preset&&(this.material.uniforms.uOpacity.value=this.preset.opacity*this.fade,this.flakes.visible=this.fade>.004)}update(e,t){if(!this.preset)return;let n=du(`weather`),r=this.preset,i=this._half,a=this._points,o=this._velocity,s=this.material.uniforms;this.camera.getWorldPosition(this.flakes.position),this.camera.getWorldDirection(Qf);let c=t.speed||0;$f.copy(Qf).multiplyScalar(-c),s.uFlow.value.copy($f),this.renderer.getDrawingBufferSize(ep),s.uPixelsPerUnit.value=ep.y*this.camera.projectionMatrix.elements[5]*.5;let l=Math.max(0,c-r.streakFrom);s.uStreak.value=Math.min(r.streakMax,l*r.streakRate)*n;let u=Math.max(1,Math.round(this.count*(n<1?n:1)));this.geometry.setDrawRange(0,u);for(let t=0;t<u;t++){let n=t*3,r=a[n]+(o[n]+$f.x)*e,s=a[n+1]+o[n+1]*e,c=a[n+2]+(o[n+2]+$f.z)*e;r>i.x?r-=i.x*2:r<-i.x&&(r+=i.x*2),s>i.y?s-=i.y*2:s<-i.y&&(s+=i.y*2),c>i.z?c-=i.z*2:c<-i.z&&(c+=i.z*2),a[n]=r,a[n+1]=s,a[n+2]=c}this.geometry.attributes.position.needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose(),this.scene.remove(this.flakes),this.scene=null,this.camera=null,this.renderer=null}},ip=new W(0,1,0),ap=new W,op=new W,sp=new W,cp=new W,lp=new q,up=new W,dp=class e{constructor(t,n){let r=$.world.oncoming,i=$.world.road;this.scene=t,this.road=n,this.enabled=r.enabled,this.lanes=Fd().oncomingCentres,this.rng=zu(r.seed),this.group=new Cn,this.group.name=`Oncoming`,t.add(this.group);let a=Math.max(1,Math.round(r.count));this.count=a,this.bodyGeometry=new X(r.body.width,r.body.height,r.body.length),this.bodyGeometry.translate(0,r.body.height*.5,0),this.bodyMaterial=new ni({color:r.body.color}),Kd(this.bodyMaterial,i.surface.neonFadeStart,i.surface.neonFadeEnd),this.lampTexture=fd($.sky.stars.texture,r.lamp.textureSize),this.lampGeometry=e._buildLamps(r),this.lampMaterial=new ni({map:this.lampTexture,color:r.lamp.color,transparent:!0,blending:2,depthWrite:!1,toneMapped:!1,opacity:r.lamp.opacity}),Kd(this.lampMaterial,i.surface.neonFadeStart,i.surface.neonFadeEnd),this.bodies=new Ei(this.bodyGeometry,this.bodyMaterial,a),this.lamps=new Ei(this.lampGeometry,this.lampMaterial,a);for(let e of[this.bodies,this.lamps])e.instanceMatrix.setUsage(He),e.frustumCulled=!1,e.visible=this.enabled,this.group.add(e);this.lamps.renderOrder=1,this.vehicles=[];for(let e=0;e<a;e++)this.vehicles.push({distance:0,lateral:this.lanes[0],speed:0,scale:1});this._seeded=!1}static _buildLamps(e){let t=e.lamp,n=new na(t.size,t.size),r=new Tr,i=e.body.length*.5+.05,a=[];for(let e of[-1,1]){let r=n.clone();r.translate(e*t.spacing*.5,t.y,i),a.push(r)}let o=[],s=[],c=[],l=0;for(let e of a){let t=e.attributes.position.array,n=e.attributes.uv.array;for(let e=0;e<t.length;e++)o.push(t[e]);for(let e=0;e<n.length;e++)s.push(n[e]);for(let t of e.index.array)c.push(l+t);l+=e.attributes.position.count,e.dispose()}return n.dispose(),r.setAttribute(`position`,new pr(o,3)),r.setAttribute(`uv`,new pr(s,2)),r.setIndex(c),r}_respawn(e,t){let n=$.world.oncoming,r=this.rng;e.lateral=this.lanes[Math.floor(r.next()*this.lanes.length)],e.speed=r.range(n.speed.min,n.speed.max),e.scale=1+(r.next()*2-1)*n.scaleJitter,e.distance=t+r.next()*n.spawnJitter}update(e,t){if(!this.enabled)return;let n=$.world.oncoming,r=t.distance||0,i=$.player.bike.maxSpeed;if(!this._seeded){this._seeded=!0;for(let e=0;e<this.vehicles.length;e++)this._respawn(this.vehicles[e],r+n.spawnAhead*(e/this.vehicles.length))}for(let t=0;t<this.vehicles.length;t++){let a=this.vehicles[t];a.distance-=a.speed*i*e,r-a.distance>n.recycleBehind&&this._respawn(a,r+n.spawnAhead),this.road.path.frameAt(a.distance,ap,op,sp),cp.crossVectors(sp,ip),lp.makeBasis(sp,ip,cp),lp.setPosition(ap.x+sp.x*a.lateral,ap.y,ap.z+sp.z*a.lateral),up.set(a.scale,a.scale,a.scale),lp.scale(up),this.bodies.setMatrixAt(t,lp),this.lamps.setMatrixAt(t,lp)}this.bodies.instanceMatrix.needsUpdate=!0,this.lamps.instanceMatrix.needsUpdate=!0}dispose(){this.bodyGeometry.dispose(),this.lampGeometry.dispose(),this.bodyMaterial.dispose(),this.lampMaterial.dispose(),this.lampTexture.dispose(),this.bodies.dispose(),this.lamps.dispose(),this.scene.remove(this.group),this.group.clear(),this.scene=null,this.road=null}};function fp(e,t){return df(e,t),e}function pp(e){let t=e.rearBox;return t?t.offset+t.length*.5:e.size.length*.5}function mp(e){let t=e.rearBox;return t?e.size.height+t.height:e.size.height}function hp(e){let t=e.rearBox;return e.size.height*.5+(t?t.height:0)}function gp(e,t,n){let r=e.truck,i=e.size,a=pp(e),o=-i.height*.5-(e.rideHeight||0),s=r.wheels,c=()=>{let e=new Ui(s.radius,s.radius,s.width,s.sides);return e.rotateZ(Math.PI/2),fp(e,s.color)},l=i.width*.5-s.inset;for(let e of s.axles)for(let r of[-1,1])t.add(c(),n.makeTranslation(r*l,o+s.radius,e));let u=r.bumper;t.add(fp(new X(i.width*u.widthScale,u.height,u.depth),u.color),n.makeTranslation(0,o+u.y,a+u.depth*.5));let d=r.mudFlaps,f=s.axles[s.axles.length-1];for(let e of[-1,1])t.add(fp(new X(d.width,d.height,.04),d.color),n.makeTranslation(e*l,o+d.height*.5,f+s.radius+d.gap));let p=r.doors,m=mp(e),h=hp(e),g=(e,r,i,o)=>t.add(fp(new X(i,o,p.depth),p.color),n.makeTranslation(e,r,a+p.depth*.5));g(0,h-m*.5,p.seam,m*p.reach);let _=i.width*.5-p.hingeInset;for(let e=0;e<p.hinges;e++){let t=h-m*(.08+(e+.5)/p.hinges*.84);for(let e of[-1,1])g(e*_,t,p.hingeWidth,p.seam)}}function _p(e,t,n){let r=e.markers,i=e.size,[a,o,s]=r.size,c=hp(e),l=pp(e),u=(r.count-1)*r.spacing;for(let e=0;e<r.count;e++)t.add(new X(a,o,s),n.makeTranslation(-u*.5+e*r.spacing,c-o*.5,l+s*.5));let d=r.side;if(!d)return;let f=i.width*.5+d.out,p=c-d.drop,m=-i.length*.5+d.margin,h=l-d.margin;for(let e=0;e<d.count;e++){let r=m+(h-m)*e/Math.max(1,d.count-1);for(let e of[-1,1])t.add(new X(d.size[0],d.size[1],d.size[2]),n.makeTranslation(e*f,p,r))}}function vp(e,t){return df(e,t),e}function yp(e,t){return df(e,t),e}var bp=class{constructor(e,t){let n=$.world.traffic.vehicle,r=$.world.road.surface;this.type=e,this.count=t,this.group=new Cn,this.group.name=`Traffic_`+e.name,this.geometries=[],this.materials=[],this.meshes=[],this.bodyMaterial=new ni({color:n.bodyColor,vertexColors:!0}),this.stripMaterial=new ni({color:16777215,vertexColors:!0,toneMapped:!1}),this.tailMaterial=new ni({color:16777215,vertexColors:!0,toneMapped:!1});for(let e of[this.bodyMaterial,this.stripMaterial,this.tailMaterial])Kd(e,r.neonFadeStart,r.neonFadeEnd),this.materials.push(e);this.body=this._instance(this._buildBody(e),this.bodyMaterial,`Body`),this.strip=this._instance(this._buildStrips(e,n),this.stripMaterial,`Strip`),this.tail=this._instance(this._buildTails(e,n),this.tailMaterial,`Tail`),this._buildGlow(e,n,r),e.beacon&&this._buildBeacon(e,r)}_instance(e,t,n){let r=new Ei(e,t,this.count);return r.name=`Traffic_`+this.type.name+`_`+n,r.instanceMatrix.setUsage(He),r.frustumCulled=!1,this.group.add(r),this.geometries.push(e),this.meshes.push(r),r}_buildBody(e){let t=new Xd,n=new q,r=e.size;t.add(new X(r.width,r.height,r.length),n.identity());let i=e.cabin,a=new X(i.width,i.height,i.length),o=a.attributes.position;for(let e=0;e<o.count;e++)o.getY(e)>0&&(o.setX(e,o.getX(e)*i.taper),o.setZ(e,o.getZ(e)*i.taper));a.computeVertexNormals(),t.add(a,n.makeTranslation(0,r.height*.5+i.height*.5,i.offset));let s=e.rearBox;return s&&t.add(new X(s.width,s.height,s.length),n.makeTranslation(0,r.height*.5+s.height*.5,s.offset)),e.truck&&gp(e,t,n),t.build(`traffic-body-`+e.name)}_buildStrips(e,t){let n=new Xd,r=new q,i=e.size,a=t.strip,o=i.length*a.lengthScale;for(let e=0;e<2;e++){let t=e===0?1:-1;n.add(new X(.04,a.height,o),r.makeTranslation(t*(i.width*.5+a.inset),a.y,0))}e.markers&&_p(e,n,r);let s=t.rear.outline,c=i.length*.5+s.depth*.5,l=Math.max(.06,i.width*.5-s.inset),u=Math.max(.06,i.height*.5-s.inset),d=e.outlineGain===void 0?1:e.outlineGain;if(d<=0)return n.build(`traffic-strip-`+e.name);for(let e=0;e<2;e++){let t=e===0?1:-1;n.add(yp(new X(l*2,s.thickness,s.depth),d),r.makeTranslation(0,t*u,c)),n.add(yp(new X(s.thickness,u*2,s.depth),d),r.makeTranslation(t*l,0,c))}return n.build(`traffic-strip-`+e.name)}_buildTails(e,t){let n=new Xd,r=new q,i=t.tail,a=e.size,o=a.length*.5;if(e.singleTail)return n.add(vp(new X(i.width*.55,i.height,.05),i.color),r.makeTranslation(0,i.y,o)),n.build(`traffic-tail-`+e.name);let s=Math.min(i.spacing,a.width*.5-i.width*.5);for(let e=0;e<2;e++){let t=e===0?1:-1;n.add(vp(new X(i.width,i.height,.05),i.color),r.makeTranslation(t*s,i.y,o))}let c=i.bar;n.add(vp(new X(Math.min(c.width,a.width*.82),c.height,.05),i.color),r.makeTranslation(0,c.y,o));let l=e.truck;if(l){let e=l.plate;n.add(vp(new X(e.width,e.height,.05),e.color),r.makeTranslation(e.x,e.y,a.length*.5+.03))}return n.build(`traffic-tail-`+e.name)}_buildGlow(e,t,n){let r=t.glow,i=t.rear.glow,a=e.size;this.glowTexture=fd({coreStop:.3,coreAlpha:1,midStop:.55,midAlpha:.62,tailStop:.82,tailAlpha:.12},r.textureSize),this.glowTexture.name=`traffic-glow`;let o=new Xd,s=new q,c=new na(a.width*i.widthScale,a.height*i.heightScale);df(c,e.rearGlow===void 0?1:e.rearGlow),o.add(c,s.makeTranslation(0,0,a.length*.5+i.offset));let l=new na(r.size,r.size);l.rotateX(-Math.PI/2),df(l,r.groundLevel),o.add(l,s.makeTranslation(0,-a.height*.5+r.y,0)),this.glowMaterial=new ni({map:this.glowTexture,color:16777215,vertexColors:!0,transparent:!0,blending:2,depthWrite:!1,opacity:i.opacity,toneMapped:!1,fog:!1}),Kd(this.glowMaterial,n.neonFadeStart,n.neonFadeEnd),this.materials.push(this.glowMaterial),this.glow=this._instance(o.build(`traffic-glow-`+e.name),this.glowMaterial,`Glow`),this.glow.renderOrder=1}_buildBeacon(e,t){let n=e.beacon,r=new Xd,i=new q,a=e.size.height*.5+e.cabin.height+n.size[1]*.5;for(let e=0;e<2;e++){let t=e===0?1:-1,o=new X(n.size[0],n.size[1],n.size[2]);df(o,e===0?n.colorA:n.colorB),r.add(o,i.makeTranslation(t*n.spacing,a,n.z))}this.beaconMaterial=new ni({color:16777215,vertexColors:!0,toneMapped:!1}),Kd(this.beaconMaterial,t.neonFadeStart,t.neonFadeEnd),this.materials.push(this.beaconMaterial),this.beacon=this._instance(r.build(`traffic-beacon-`+e.name),this.beaconMaterial,`Beacon`)}get trianglesPerVehicle(){let e=0;for(let t=0;t<this.geometries.length;t++)e+=this.geometries[t].index.count/3;return e}dispose(){for(let e=0;e<this.geometries.length;e++)this.geometries[e].dispose();for(let e=0;e<this.materials.length;e++)this.materials[e].dispose();for(let e=0;e<this.meshes.length;e++)this.meshes[e].dispose();this.glowTexture.dispose(),this.group.clear()}};function xp(e,t,n,r,i,a,o){let s=t.type.size,c=a.collision,l=Math.abs(r-n.distance),u=Math.abs(i-n.lateral),d=s.length*.5*n.scale+c.playerHalfLength,f=s.width*.5*n.scale+c.playerHalfWidth,p=l<d&&u<f;c.mode===`arcade`&&p&&!n.hit&&(n.hit=!0,e.hits++,o.applyImpact(c.speedLoss),o.knockAside(i>=n.lateral?c.knockLateral:-c.knockLateral)),n.hit&&l>d*1.6&&(n.hit=!1);let m=r<n.distance;if(m!==n.wasBehind){let t=u-f;t>0&&t<a.nearMiss.range&&e._nearMissCooldown<=0&&(e.nearMisses++,e._nearMissCooldown=a.nearMiss.cooldown)}n.wasBehind=m}var Sp=new W(0,1,0),Cp=new W,wp=new W,Tp=new W,Ep=new q,Dp=new Dt,Op=new W,kp=new W,Ap=new J,jp=class{constructor(e,t,n){let r=$.world.traffic;this.scene=e,this.road=t,this.bike=n,this.rng=zu(r.seed),this.lanes=Fd().laneCentres,this.group=new Cn,this.group.name=`Traffic`,e.add(this.group),this._playerSpeed=0,this.hits=0,this.nearMisses=0,this._nearMissCooldown=0,this._beaconPhase=0,this.fleets=[];let i=$.player.bike.startDistance,a=0,o=r.types.reduce((e,t)=>e+t.count,0);for(let e of r.types){let t=new bp(e,e.count);this.group.add(t.group);let n=[];for(let t=0;t<e.count;t++)n.push({distance:0,lane:0,lateral:0,laneLateral:0,speed:0,scale:1,weavePhase:0,wasBehind:!0,hit:!1,active:!0});let s={type:e,mesh:t,vehicles:n};this.fleets.push(s);for(let e=0;e<n.length;e++)a++,this._respawn(s,n[e],i+r.spawnAhead*a/o,e)}}get beaconPhase(){return this._beaconPhase}update(e,t){let n=$.world.traffic;if(this._nearMissCooldown=Math.max(0,this._nearMissCooldown-e),this._beaconPhase+=e,!n.enabled){this.group.visible=!1,t.hits=this.hits,t.nearMisses=this.nearMisses;return}this.group.visible=!0;let r=t.distance||0,i=t.lateral||0,a=$.player.bike.maxSpeed;this._playerSpeed=t.speed||0;let o=this.model.density,s=Et.clamp(r/o.fullAt,0,1),c=Math.min(o.max,o.start+(o.max-o.start)*s**+o.curve);for(let t=0;t<this.fleets.length;t++){let o=this.fleets[t],s=o.vehicles,l=n.mix?n.mix[o.type.name]:void 0,u=l===void 0?1:Et.clamp(l,0,1),d=Math.max(1,Math.round(s.length*c*u));for(let t=0;t<s.length;t++){let c=s[t],l=t<d;if(l&&!c.active&&Math.abs(r-c.distance)<n.spawnClear&&this._respawn(o,c,r+n.spawnAhead,t),c.active=l,!c.active){Ep.makeScale(0,0,0),o.mesh.body.setMatrixAt(t,Ep),o.mesh.strip.setMatrixAt(t,Ep),o.mesh.tail.setMatrixAt(t,Ep),o.mesh.glow.setMatrixAt(t,Ep),o.mesh.beacon&&o.mesh.beacon.setMatrixAt(t,Ep);continue}c.distance+=c.speed*a*e;let u=o.type.weave;u&&(c.weavePhase+=e*(Math.PI*2/u.period),c.lateral=c.laneLateral+Math.sin(c.weavePhase)*u.amount*this.model.weaveScale),r-c.distance>n.recycleBehind&&this._respawn(o,c,r+n.spawnAhead,t),xp(this,o,c,r,i,n,this.bike),this._place(o,c,t,r)}o.mesh.body.instanceMatrix.needsUpdate=!0,o.mesh.strip.instanceMatrix.needsUpdate=!0,o.mesh.tail.instanceMatrix.needsUpdate=!0,o.mesh.glow.instanceMatrix.needsUpdate=!0,o.mesh.beacon&&this._updateBeacons(o)}t.hits=this.hits,t.nearMisses=this.nearMisses}_updateBeacons(e){let t=e.type.beacon,n=Math.sin(this._beaconPhase*Math.PI*2*t.rate)>=0;for(let r=0;r<e.vehicles.length;r++)Ap.set(n?t.colorA:t.colorB),e.mesh.beacon.setColorAt(r,Ap);e.mesh.beacon.instanceMatrix.needsUpdate=!0,e.mesh.beacon.instanceColor&&(e.mesh.beacon.instanceColor.needsUpdate=!0)}get model(){let e=$.world.traffic.models;return $.autopilot.enabled?e.god:e.player}_admits(e,t,n,r,i){let a=this.model,o=a.escape,s=a.gap.base+a.gap.reaction*i,c=new Set([t]),l=+!!e.truck;for(let e=0;e<this.fleets.length;e++){let i=this.fleets[e],a=!!i.type.truck;for(let e=0;e<i.vehicles.length;e++){let u=i.vehicles[e];if(u===r||!u.active)continue;let d=Math.abs(u.distance-n);if(u.lane===t&&d<s||o.enabled&&!(d>=o.window)&&(c.add(u.lane),a&&l++,c.size>o.maxAbreast||l>o.trucksAbreast))return!1}}return!0}_laneOrder(e,t){let n=[];for(let e=t;e<this.lanes.length;e++)n.push(e);return n.sort((t,n)=>Math.abs(t-e)-Math.abs(n-e)),n}_respawn(e,t,n,r){let i=$.world.traffic,a=e.type,o=this.rng,s=(a.speed.min+a.speed.max)*.5,c=(1-Math.min(1,Math.max(0,(s-.3)/.5)))*(this.lanes.length-1),l=i.laneDiscipline,u=c+(o.next()*2-1)*l,d=a.minLane||0,f=Math.min(this.lanes.length-1,Math.max(d,Math.round(u))),p=this.model,m=(a.speed.min+a.speed.max)*.5,h=(a.speed.max-a.speed.min)*.5*p.speedSpread;t.speed=o.range(m-h,m+h),t.scale=1+(o.next()*2-1)*i.vehicle.scaleJitter,t.weavePhase=o.next()*Math.PI*2,t.wasBehind=!0,t.hit=!1;let g=p.escape,_=g.enabled?g.attempts:1,v=this._laneOrder(f,d),y=n+o.next()*i.spawnJitter,b=!1;for(let e=0;e<_&&!b;e++){for(let e of v)if(this._admits(a,e,y,t,this._playerSpeed)){t.lane=e,t.distance=y,b=!0;break}b||(y+=g.enabled?g.push:i.minGap)}b||(t.lane=f,t.distance=y+i.spawnAhead),t.laneLateral=this.lanes[t.lane],t.lateral=t.laneLateral;let x=i.look&&i.look[a.name]||null;Ap.set(x&&x.bodyColor||a.bodyColor||i.bodyPalette[Math.floor(o.next()*i.bodyPalette.length)]),e.mesh.body.setColorAt(r,Ap),e.mesh.body.instanceColor&&(e.mesh.body.instanceColor.needsUpdate=!0),Ap.set(x&&x.stripColor||a.stripColor),e.mesh.strip.setColorAt(r,Ap),e.mesh.strip.instanceColor&&(e.mesh.strip.instanceColor.needsUpdate=!0),e.mesh.glow.setColorAt(r,Ap),e.mesh.glow.instanceColor&&(e.mesh.glow.instanceColor.needsUpdate=!0)}_place(e,t,n,r){let i=e.type,a=$.world.traffic.vehicle.glow;this.road.path.frameAt(t.distance,Cp,wp,Tp),kp.crossVectors(Tp,Sp),Ep.makeBasis(Tp,Sp,kp),Dp.setFromRotationMatrix(Ep);let o=Cp.x+Tp.x*t.lateral,s=Cp.z+Tp.z*t.lateral,c=i.size.height*.5*t.scale+(i.rideHeight||0);Op.setScalar(t.scale),Ep.compose(Cp.set(o,Cp.y+c,s),Dp,Op),e.mesh.body.setMatrixAt(n,Ep),e.mesh.strip.setMatrixAt(n,Ep),e.mesh.tail.setMatrixAt(n,Ep),e.mesh.beacon&&e.mesh.beacon.setMatrixAt(n,Ep);let l=Math.abs(r-t.distance),u=Et.clamp(l/a.nearFade,0,1);Op.setScalar(t.scale*u*u*(3-2*u)),Ep.compose(Cp,Dp,Op),e.mesh.glow.setMatrixAt(n,Ep)}get vehicleCount(){let e=0;for(let t=0;t<this.fleets.length;t++)e+=this.fleets[t].vehicles.length;return e}dispose(){this.scene.remove(this.group);for(let e=0;e<this.fleets.length;e++)this.fleets[e].mesh.dispose();this.fleets.length=0,this.group.clear(),this.scene=null,this.road=null,this.bike=null}};function Mp(e,t,n,r,i){e._previousYaw===null&&(e._previousYaw=i);let a=t>0?(i-e._previousYaw)/t:0;e._previousYaw=i,e._yawRate=Cu.damp(e._yawRate,a,r.curveTau,t);let o=Et.clamp(n.steer*r.leanFromSteer-e._yawRate*r.leanFromCurve,-r.leanMax,r.leanMax);e.lean=Cu.damp(e.lean,o,r.leanTau,t)}function Np(e,t,n,r){let i=e.framing.fov,a=e.framing.fovMax,o=r*du(`fovRamp`);e.fov=Cu.damp(e.fov,i+(a-i)*o,n.fovTau,t),Math.abs(e.fov-e._appliedFov)>.02&&(e._appliedFov=e.fov,e.camera.fov=e.fov,e.camera.updateProjectionMatrix())}function Pp(e,t){t.length=e.count;let n=e.topSpeed;for(let r=e.count-1;r>=0;r--)t[r]=n,n*=e.step;return t}var Fp=[];function Ip(e,t,n){let r=Pp(t,Fp);if(e<=.002)return n.gear=0,n.rpm=0,n;let i=0;for(;i<t.count-1&&e>r[i];)i++;let a=r[i],o=i===0?0:r[i-1],s=Math.min(1,(e-o)/(a-o));return n.gear=i+1,n.rpm=t.bottomRpm+(1-t.bottomRpm)*s,n}var Lp=new W,Rp=new W,zp=new W,Bp=new W,Vp=new W,Hp=new W,Up=new W,Wp=Math.PI*2,Gp={steer:0,throttle:0,brake:0},Kp={gear:0,rpm:0};function qp(e,t,n){let r=$.player.bike,i=$.player.camera,a=e.framing.camera,o=e._input||Gp,s=e.speed/r.maxSpeed,c=i.bob,l=du(`bob`),u=(c.floor+(1-c.floor)*s)*l;e._bobPhase+=t*Wp*c.frequency*u,e._bobPhase>Wp*2&&(e._bobPhase-=Wp*2);let d=Math.sin(e._bobPhase)*c.vertical*u,f=Math.sin(e._bobPhase*.5+1.1)*c.lateral*u,p=Math.sin(e._bobPhase*.5+.4)*c.roll*u,m=i.shake;e._shakeTime+=t*m.frequency;let h=m.amount*s**+m.exponent*du(`shake`),g=e._shakeNoise(e._shakeTime,0)*h,_=e._shakeNoise(e._shakeTime,17.3)*h,v=e._shakeNoise(e._shakeTime*.7,41.7)*m.roll*s**+m.exponent;e.path.frameAt(e.distance,Lp,Rp,zp);let y=e.lateral+f+g;e.camera.position.set(Lp.x+zp.x*y,Lp.y+i.height+a.height+d+_,Lp.z+zp.z*y),e.path.frameAt(e.distance+i.lookAhead,Bp,Vp,Hp),Up.set(Bp.x+Hp.x*y,Bp.y+i.height+a.height,Bp.z+Hp.z*y).sub(e.camera.position).normalize();let b=Math.asin(Et.clamp(Up.y,-1,1))+e.framing.pitch+a.pitch,x=Math.atan2(-Up.x,-Up.z);Mp(e,t,o,r,x),e.camera.rotation.set(b,x,-e.lean+p+v),Np(e,t,i,s),n.steer=o.steer,n.lean=e.lean,n.lateral=e.lateral,n.bob=d,Ip(s,r.gearbox,Kp),n.rpm=Kp.rpm,n.gear=Kp.gear}var Jp={steer:0,throttle:0,brake:0},Yp={steer:0,throttle:0,brake:0},Xp=class{constructor(e,t,n){let r=$.player.bike;this.camera=e,this.path=t,this.framing=n,this._shakeNoise=id(zu(4177)),this._shakeTime=0,this.distance=r.startDistance,this.speed=r.startSpeed,this.lateral=0,this.lean=0,this._lateralTarget=0,this._yawRate=0,this._previousYaw=null,this._bobPhase=0,this._input=null,this.fov=n.fov,this._appliedFov=n.fov,this.camera.rotation.order=`YXZ`}step(e,t){let n=$.player.bike,r=this._effectiveInput(t.input||Jp,t);this._input=r,this._updateSpeed(e,r,n,t);let i=this.speed/n.maxSpeed;this.distance+=this.speed*e,this._updateLateral(e,r,n,i),t.distance=this.distance,t.speed=this.speed,t.speedRatio=i,t.lateral=this.lateral,t.drive=this.drive}place(e,t){qp(this,e,t)}update(e,t){this.step(e,t),this.place(e,t)}_effectiveInput(e,t){let n=$.capture;if(!n.enabled||!n.drift.enabled)return e;let r=(t.elapsed||0)*(Math.PI*2/n.drift.period);return Yp.steer=Et.clamp(e.steer+Math.sin(r)*n.drift.amount,-1,1),Yp.throttle=e.throttle,Yp.brake=e.brake,Yp}applyImpact(e){this.speed*=e}knockAside(e){let t=$.player.bike;this._lateralTarget=Et.clamp(this._lateralTarget+e,-t.lateralLimit,t.lateralLimit),this.lateral=Et.clamp(this.lateral+e*.5,-t.lateralLimit,t.lateralLimit)}placeLateral(e){let t=$.player.bike,n=Et.clamp(e,-t.lateralLimit,t.lateralLimit);this.lateral=n,this._lateralTarget=n}_updateSpeed(e,t,n,r){let i=$.controls.floorByMode[r&&r.controlMode]??n.throttleFloor,a=Math.max(t.throttle,i);this.drive=a;let o=a*n.acceleration,s=t.brake*n.brakeForce,c=n.dragQuadratic*this.speed*this.speed+n.dragLinear*this.speed;this.speed=Et.clamp(this.speed+(o-s-c)*e,0,n.maxSpeed)}_updateLateral(e,t,n,r){let i=.35+.65*r;this._lateralTarget+=t.steer*n.lateralSpeed*i*e,Math.abs(t.steer)<.05&&(this._lateralTarget=Cu.damp(this._lateralTarget,0,n.lateralReturnTau,e)),this._lateralTarget=Et.clamp(this._lateralTarget,-n.lateralLimit,n.lateralLimit),this.lateral=Cu.damp(this.lateral,this._lateralTarget,n.lateralTau,e)}dispose(){this.camera=null,this.path=null}};function Zp(e,t,n,r){let i=$.player.bike,a=e._obstacles,o=e.bike.lateral,s=i.lateralLimit;if(r.autopilotBlocked=!1,a.length===0){let e=nm(n,-s,s);return{line:e,target:e,blocked:!1}}let c=.35+.65*(e.bike.speed/i.maxSpeed),l=i.lateralSpeed*c*t.traffic.reachSafety,u=Math.max(3,t.traffic.candidates|0),d=e=>-s+2*s*e/(u-1),f=[];for(let e=0;e<a.length;e++){let n=a[e],r=!1;for(let e=0;e<u&&!r;e++)$p(o,d(e),l,i.lateralTau,n,t)>=t.traffic.safety&&(r=!0);f.push(r)}let p=null,m=null;for(let e=0;e<u;e++){let r=d(e),s=1/0,c=1/0,u=1/0;for(let e=0;e<a.length;e++){let n=a[e],d=$p(o,r,l,i.lateralTau,n,t);f[e]&&d<s&&(s=d);let p=Math.abs(r-n.lateral)-n.reach;p<c&&(c=p),e===0&&(u=p)}if(Math.abs(r-o)<=t.traffic.escapeReach&&(!m||c>m.clearance)&&(m={target:r,clearance:c}),s<t.traffic.safety)continue;let h=Qp(r,n,o,t,u);(!p||h<p.cost)&&(p={target:r,cost:h})}if(!p){r.autopilotBlocked=!0,r.autopilotBest=m?m.clearance:-99;let e=nm(m?m.target:o,-s,s);return{line:e,target:e,blocked:!0}}let h=p.target,g=e.line;return Math.abs(g-h)>.001&&tm(g,a,t,o,l,s)&&Qp(g,n,o,t,em(g,a))-p.cost<t.traffic.switchMargin&&(h=g),{line:h,target:h,blocked:!1}}function Qp(e,t,n,r,i){return(Number.isFinite(i)?Math.abs(i-r.traffic.thread)*r.traffic.threadWeight:0)+Math.abs(e-t)*r.traffic.lineWeight+Math.abs(e-n)*r.traffic.effortWeight}function $p(e,t,n,r,i,a){let o=e+Math.sign(t-e)*Math.min(Math.abs(t-e),n*Math.max(0,i.time-r)),s=Math.min(e,o),c=Math.max(e,o),l=i.lateral<s?s:i.lateral>c?c:i.lateral;return Math.abs(l-i.lateral)-i.reach}function em(e,t){let n=t[0];return n?Math.abs(e-n.lateral)-n.reach:1/0}function tm(e,t,n,r,i,a){if(e<-a||e>a)return!1;let o=$.player.bike.lateralTau;for(let a of t)if($p(r,e,i,o,a,n)<n.traffic.safety)return!1;return!0}function nm(e,t,n){return e<t?t:e>n?n:e}var rm=class{constructor(e,t,n){this.path=e,this.traffic=t,this.bike=n,this.values={steer:0,throttle:0,brake:0},this.line=0,this.target=0,this.blocked=!1,this._steer=0,this._brakeTimer=0,this._time=0,this._drift=id(zu(9173)),this._jitter=id(zu(2851)),this._position=new W,this._tangent=new W,this._lateral=new W,this._ahead=new W,this._obstacles=[]}update(e,t){let n=$.autopilot;this._time+=e;let r=this._racingLine(n);this._collectObstacles(n,t);let i=Zp(this,n,r,t);this.blocked=i.blocked,this.line=i.line;let a=$.player.bike,o=.35+.65*(this.bike.speed/a.maxSpeed),s=a.lateralSpeed*o*e;this.target+=Et.clamp(i.target-this.target,-s,s);let c=this._roomToSpare(n),l=this._drift(this._time*n.hands.driftSpeed,0)*n.hands.driftAmount*Et.clamp(c/n.hands.steadyWithin,0,1),u=this.target+l-this.bike.lateral,d=Et.clamp(u*n.hands.steerGain,-1,1),f=1-Math.exp(-e/Math.max(n.hands.steerTau,1e-4));this._steer+=(d-this._steer)*f;let p=this._jitter(this._time*n.hands.jitterSpeed,31.7)*n.hands.jitterAmount;this._brakeTimer=i.blocked?n.throttle.brakeHold:Math.max(0,this._brakeTimer-e);let m=(t.guardPressure||0)>n.throttle.crowdedAt,h=$.player.bike.maxSpeed*n.throttle.speedFloor,g=this.bike.speed>h&&(m||this._brakeTimer>0);this.values.steer=Et.clamp(this._steer+p,-1,1),this.values.throttle=+!g,this.values.brake=g?n.throttle.brakeForce:0}_roomToSpare(e){let t=1/0;for(let n of this._obstacles){if(n.time>e.hands.steadyBefore)continue;let r=Math.abs(this.bike.lateral-n.lateral)-n.reach;r<t&&(t=r)}return t===1/0?e.hands.steadyWithin:t}_racingLine(e){let t=this.bike.distance;this.path.frameAt(t,this._position,this._tangent,this._lateral),this.path.pointAt(t+e.line.lookAhead,this._ahead);let n=this._ahead.sub(this._position).dot(this._lateral),r=$.player.bike.lateralLimit*e.line.reach;return Et.clamp(n/e.line.lookAhead*e.line.gain*100,-r,r)}_collectObstacles(e,t){let n=$.world.traffic.collision,r=this._obstacles;r.length=0;let i=this.bike.distance,a=this.bike.speed,o=e.traffic.horizon,s=$.player.bike.maxSpeed;for(let t of this.traffic.fleets){let c=t.type.size.width*.5,l=t.type.size.length*.5,u=t.type.weave;for(let d of t.vehicles){if(!d.active)continue;let t=d.distance-i,f=l*d.scale,p=Math.sign(t)*Math.max(0,Math.abs(t)-f),m=p/(a-d.speed*s),h=m>0?m:1/0,g=Math.abs(p)<e.traffic.alongside;!g&&h>o||r.push({lateral:am(d,u,Math.min(h,o)),reach:c*d.scale+n.playerHalfWidth,time:g?0:Math.min(h,o)})}}r.sort(im),t.autopilotObstacles=r.length}dispose(){this._obstacles.length=0}};function im(e,t){return e.time-t.time}function am(e,t,n){if(!t)return e.lateral;let r=e.weavePhase+n*Math.PI*2/t.period;return e.laneLateral+Math.sin(r)*t.amount}var om=class{constructor(e,t){this.bike=e,this.traffic=t,this.eases=0,this.saves=0,this.worst=0,this.pressure=0,this.trapped=0,this.buckets=[0,0,0,0,0],this._blocked=[],this._imminent=[]}update(e,t){if(!$.autopilot.enabled||!$.autopilot.guard.enabled)return;let n=$.autopilot.guard,r=$.player.bike.lateralLimit,i=this._blocked;if(i.length=0,this.pressure=0,t.guardPressure=0,this._collect(e,n,i,n.lead),i.length===0)return;let a=this.bike.lateral,o=sm(a,i,r);o!==null&&(this.pressure=Math.abs(o-a),t.guardPressure=this.pressure),this._imminent.length=0,this._collect(e,n,this._imminent,1);let s=cm(a,this._imminent);if(o===null){this.pressure=1/0,t.guardPressure=1/0,this.trapped++,t.guardTrapped=this.trapped;return}let c=Math.abs(o-a);if(!s){let r=n.easeRate*e;if(c>r){this.bike.placeLateral(a+Math.sign(o-a)*r),t.lateral=this.bike.lateral,this.eases++,t.guardEases=this.eases;return}}if(c>1e-6){if(s){this.saves++,c>this.worst&&(this.worst=c);let e=c<.1?0:c<.3?1:c<.6?2:c<1.2?3:4;this.buckets[e]++}else this.eases++;this.bike.placeLateral(o),t.lateral=this.bike.lateral}t.guardSaves=this.saves}_collect(e,t,n,r){let i=$.world.traffic.collision,a=$.player.bike.maxSpeed*e;for(let o of this.traffic.fleets){let s=o.type.size.width*.5,c=o.type.size.length*.5,l=o.type.weave;for(let u of o.vehicles){if(!u.active)continue;let o=u.distance+u.speed*a;if(Math.abs(this.bike.distance-o)>(c*u.scale+i.playerHalfLength)*r)continue;let d=l?u.laneLateral+Math.sin(u.weavePhase+e*Math.PI*2/l.period)*l.amount:u.lateral,f=s*u.scale+i.playerHalfWidth+t.floor;n.push({low:d-f,high:d+f})}}}dispose(){this._blocked.length=0,this._imminent.length=0}};function sm(e,t,n){if(!cm(e,t))return e;let r=null,i=i=>{i<-n||i>n||cm(i,t)||(r===null||Math.abs(i-e)<Math.abs(r-e))&&(r=i)},a=1e-4;for(let e of t)i(e.low-a),i(e.high+a);return i(-n),i(n),r}function cm(e,t){for(let n of t)if(e>n.low&&e<n.high)return!0;return!1}function lm(){try{let e=window.localStorage.getItem($.controls.storageKey);return e?JSON.parse(e):null}catch{return null}}function um(e){try{window.localStorage.setItem($.controls.storageKey,JSON.stringify(e))}catch{}}function dm(){let e=window.screen&&window.screen.orientation;return e&&typeof e.angle==`number`?e.angle:window.orientation||0}function fm(e,t,n){let r=(n%360+360)%360*Math.PI/180,i=Math.cos(r),a=Math.sin(r),o=e*i+t*a,s=-e*a+t*i;return-Math.atan2(o,s)*180/Math.PI}function pm(e,t,n){switch((n%360+360)%360){case 90:return-e;case 180:return-t;case 270:return e;default:return t}}var mm=class e{constructor(e=!0){this.enabled=!!e;let t=lm()||{};this.mode=t.mode===`touch`||t.mode===`tilt`?t.mode:$.controls.defaultMode,$.controls.tilt.sensitivity=typeof t.sensitivity==`number`?t.sensitivity:$.controls.tilt.sensitivity,this.steer=0,this.live=!1,this.source=null,this.fellBack=!1,this.fallbackReason=``,this.motionEvents=0,this.orientationEvents=0,this.motionReadings=0,this.orientationReadings=0,this.motionRate=0,this.orientationRate=0,this.gravity={x:0,y:0,z:0},this.angle=dm(),this.secure=typeof window<`u`&&window.isSecureContext!==!1,this.onNotice=null,this.onChange=null,this._neutral=null,this._raw=0,this._smoothed=0,this._waited=0,this._listening=!1,this._armed=!1,this._denied=!1,this._rateWindow=0,this._motionWindow=0,this._orientationWindow=0,this._onMotion=this._onMotion.bind(this),this._onOrientation=this._onOrientation.bind(this),this.enabled&&this._listen()}static get needsPermission(){if(typeof window>`u`)return!1;let e=window.DeviceMotionEvent,t=window.DeviceOrientationEvent;return!!e&&typeof e.requestPermission==`function`||!!t&&typeof t.requestPermission==`function`}static get supported(){return typeof window<`u`&&(`DeviceMotionEvent`in window||`DeviceOrientationEvent`in window)}async request(){if(!this.enabled)return!1;if(!this.secure)return this._fallback($.ui.controls.tiltInsecure);if(!e.supported)return this._fallback($.ui.controls.tiltMissing);this._denied=!1;for(let e of[window.DeviceMotionEvent,window.DeviceOrientationEvent])if(e&&typeof e.requestPermission==`function`)try{await e.requestPermission()!==`granted`&&(this._denied=!0)}catch{this._denied=!0}return this._listen(),this._armed=!0,this._waited=0,!0}_listen(){this._listening||(window.addEventListener(`devicemotion`,this._onMotion),window.addEventListener(`deviceorientation`,this._onOrientation),this._listening=!0,this._waited=0)}_onMotion(e){this.motionEvents++,this._motionWindow++;let t=e.accelerationIncludingGravity;if(!t||t.x===null&&t.y===null&&t.z===null)return;let n=t.x||0,r=t.y||0,i=t.z||0;if(Math.abs(n)+Math.abs(r)+Math.abs(i)<.5||(this.motionReadings++,this.gravity.x=n,this.gravity.y=r,this.gravity.z=i,this.angle=dm(),this.source===`orientation`&&this.motionReadings<2))return;this.source=`motion`;let a=$.controls.tilt.invert?-1:1;this._raw=fm(n,r,this.angle)*a,this._neutral===null&&(this._neutral=this._raw),this.live=!0}_onOrientation(e){if(this.orientationEvents++,this._orientationWindow++,e.beta===null&&e.gamma===null||(this.orientationReadings++,this.lastBeta=e.beta||0,this.lastGamma=e.gamma||0,this.source===`motion`))return;this.angle=dm(),this.source=`orientation`;let t=$.controls.tilt.invert?-1:1;this._raw=pm(e.beta||0,e.gamma||0,this.angle)*t,this._neutral===null&&(this._neutral=this._raw),this.live=!0}recalibrate(){this._neutral=this._raw,this._smoothed=0,this.steer=0}setMode(e){let t=e===`tilt`?`tilt`:`touch`;return t===this.mode?t:(this.mode=t,t===`tilt`&&(this.fellBack=!1,this.fallbackReason=``,this._neutral=null,this._waited=0,this._listening?this.recalibrate():this.enabled&&this.request()),this._save(),this.onChange&&this.onChange(t),t)}cycleSensitivity(){let e=$.controls.tilt.sensitivitySteps,t=e.indexOf($.controls.tilt.sensitivity);return $.controls.tilt.sensitivity=e[(t+1)%e.length],this._save(),$.controls.tilt.sensitivity}_save(){um({mode:this.mode,sensitivity:$.controls.tilt.sensitivity})}_fallback(e){return this.fellBack=!0,this.fallbackReason=e,this.mode=`touch`,this.onNotice&&this.onNotice(e),this.onChange&&this.onChange(this.mode),!1}_diagnose(){let t=$.ui.controls;return this.secure?e.supported?this._denied?t.tiltDenied:this.motionEvents===0&&this.orientationEvents===0?t.tiltSilent:t.tiltEmpty:t.tiltMissing:t.tiltInsecure}update(e){if(this._rateWindow+=e,this._rateWindow>=1&&(this.motionRate=this._motionWindow/this._rateWindow,this.orientationRate=this._orientationWindow/this._rateWindow,this._motionWindow=0,this._orientationWindow=0,this._rateWindow=0),!this.enabled||this.mode!==`tilt`)return 0;if(!this.live)return!this._listening||!this._armed?0:(this._waited+=e,this._waited>$.controls.tilt.timeout&&this._fallback(this._diagnose()),0);let t=$.controls.tilt,n=this._raw-(this._neutral===null?this._raw:this._neutral),r=Math.sign(n)*Math.max(0,Math.abs(n)-t.deadZone),i=Math.max(1,t.range*t.sensitivity),a=Math.max(-1,Math.min(1,r/i)),o=t.tau>0?1-Math.exp(-e/t.tau):1;return this._smoothed+=(a-this._smoothed)*o,this.steer=this._smoothed,this.steer}dispose(){this._listening&&(window.removeEventListener(`devicemotion`,this._onMotion),window.removeEventListener(`deviceorientation`,this._onOrientation)),this._listening=!1,this.onNotice=null,this.onChange=null}},hm=class{constructor(e,t){let n=$.orientation;this.measure=t,this.portrait=!1,this.onChange=null,this.el=document.createElement(`div`),this.el.className=`rotate-gate`,this.el.setAttribute(`role`,`alertdialog`),this.el.setAttribute(`aria-live`,`assertive`);let r=document.createElement(`div`);r.className=`rotate-icon`,r.innerHTML=`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="22" y="6" width="20" height="36" rx="3"/><path d="M14 46a24 24 0 0 0 36 0" /><path d="M50 38v9h-9" /></svg>`;let i=document.createElement(`div`);i.className=`rotate-title`,i.textContent=n.title;let a=document.createElement(`div`);a.className=`rotate-body`,a.textContent=n.body,this.el.append(r,i,a),e.appendChild(this.el),this._onResize=()=>this.refresh(),window.addEventListener(`resize`,this._onResize),window.addEventListener(`orientationchange`,this._onResize),window.visualViewport&&window.visualViewport.addEventListener(`resize`,this._onResize),this.refresh()}static request(){try{let e=window.screen&&window.screen.orientation;return!e||!e.lock?Promise.resolve():e.lock($.orientation.lock).catch(()=>{})}catch{return Promise.resolve()}}refresh(){let{width:e,height:t}=this.measure();if(!e||!t)return;let n=$.orientation,r=e/t,i=this.portrait?r<n.leave:r<n.enter;i!==this.portrait&&(this.portrait=i,this.el.classList.toggle(`rotate-gate-on`,i),this.onChange&&this.onChange(i))}dispose(){window.removeEventListener(`resize`,this._onResize),window.removeEventListener(`orientationchange`,this._onResize),window.visualViewport&&window.visualViewport.removeEventListener(`resize`,this._onResize),this.el.remove(),this.onChange=null}},gm=`
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalMatrix * normal;
    vViewDir = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`,_m=`
  uniform vec3 uColor;
  uniform vec3 uAmbient;
  uniform vec3 uKeyColor;
  uniform vec3 uKeyDirection;
  uniform float uKeyStrength;
  uniform vec3 uRimColor;
  uniform float uRimStrength;
  uniform float uRimPower;
  uniform float uOpacity;

  varying vec3 vNormalView;
  varying vec3 vViewDir;

  #include <common>
  #include <dithering_pars_fragment>

  void main() {
    // A mirrored part is drawn through a matrix with a negative determinant,
    // which turns its triangles inside out: we end up looking at back faces
    // whose normals point away from us, and every shading term inverts. Three
    // does this flip inside its own materials; ours has to do it too, or the
    // left hand lights as the negative of the right one.
    vec3 normal = normalize(vNormalView);
    if (!gl_FrontFacing) normal = -normal;
    vec3 view = normalize(vViewDir);

    // Wrapped diffuse: the half lambert keeps the shadow side readable instead
    // of crushing it to the ambient, which matters on parts this small.
    float key = dot(normal, uKeyDirection) * 0.5 + 0.5;
    key *= key;

    vec3 color = uColor * (uAmbient + uKeyColor * key * uKeyStrength);

    float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), uRimPower);
    color += uRimColor * rim * uRimStrength;

    gl_FragColor = vec4(color, uOpacity);

    #include <colorspace_fragment>
    #include <dithering_fragment>
  }
`;function vm(e,t){let n=$.player.rider.materials.keyDirection,r=new pa({uniforms:{uColor:{value:new J(e.color)},uAmbient:{value:new J(e.ambient)},uKeyColor:{value:new J(e.key)},uKeyDirection:{value:new W(n.x,n.y,n.z).normalize()},uKeyStrength:{value:e.keyStrength},uRimColor:{value:new J(e.rim)},uRimStrength:{value:e.rimStrength},uRimPower:{value:e.rimPower},uOpacity:{value:e.opacity===void 0?1:e.opacity}},vertexShader:gm,fragmentShader:_m,fog:!1,dithering:!0,transparent:e.opacity!==void 0&&e.opacity<1,depthWrite:e.opacity===void 0||e.opacity>=1});return r.name=t,r}function ym(e,t){let n=new ni({color:e,fog:!1,toneMapped:!1});return n.name=t,n}var bm=new q;function xm(e,t){return[e[0]*t,e[1],e[2]]}function Sm(e){let t=$.player.rider;Cm(e.frame,t.bar);for(let n=0;n<2;n++){let r=n===0?1:-1;wm(e.frame,t.bar,r),Tm(e.mirrorMount,e.mirror,t.mirror,r)}}function Cm(e,t){let n=t.clamp;e.add(new X(n.width,n.height,n.depth),cf(1,[0,n.y,0],null,bm));let r=t.clampCap;for(let t=0;t<2;t++){let i=t===0?1:-1;e.add(new Ui(r.radius,r.radius,r.length,10),cf(i,[r.spacing,n.y+n.height*.25,0],[Math.PI/2,0,0],bm))}}function wm(e,t,n){let r=t.path;for(let i=0;i<r.length-1;i++)sf(e,xm(r[i],n),xm(r[i+1],n),t.radius,t.radialSegments);for(let i=1;i<r.length-1;i++)e.add(new ra(t.radius,t.radialSegments,6),cf(n,r[i],null,bm))}function Tm(e,t,n,r){sf(e,xm(n.stalkFrom,r),xm(n.stalkTo,r),n.stalkRadius,8,n.stalkTipRadius);let i=[n.headRotation.x,n.headRotation.y,n.headRotation.z];cf(r,n.stalkTo,i,bm);let a=new Ui(n.headRadius,n.headRadius,n.headDepth,n.headSegments);a.rotateX(Math.PI/2),e.add(a,bm);let o=new Ui(n.glassRadius,n.glassRadius,n.headDepth,n.headSegments);o.rotateX(Math.PI/2),o.translate(0,0,n.glassInset),t.add(o,bm)}var Em=new W,Dm=new W;function Om(e,t){let n=e.length,r=Array(t.length*n);for(let i=0;i<t.length;i++){let a=t[i],o=a.roll||0,s=Math.cos(o),c=Math.sin(o),l=a.offset?a.offset[0]:0,u=a.offset?a.offset[1]:0;for(let t=0;t<n;t++){let o=e[t][0]*a.scale[0],d=e[t][1]*a.scale[1];r[i*n+t]=new W(l+o*s-d*c,u+o*c+d*s,a.z)}}return r}function km(e){let t=0;for(let n=0;n<e.length;n++){let r=e[n],i=e[(n+1)%e.length];t+=r[0]*i[1]-i[0]*r[1]}return t}function Am(e,t){let n=e.length,r=t.length,i=Om(e,t),a=Array(r*n);for(let e=0;e<r;e++){let t=Math.max(e-1,0),o=Math.min(e+1,r-1);for(let r=0;r<n;r++){let s=(r+1)%n;Em.copy(i[o*n+r]).sub(i[t*n+r]),Dm.copy(i[o*n+s]).sub(i[t*n+s]),Em.add(Dm),Dm.copy(i[e*n+s]).sub(i[e*n+r]),a[e*n+r]=new W().crossVectors(Em,Dm).normalize()}}let o=km(e)>=0?1:-1,s=i[1].x-i[0].x,c=i[1].y-i[0].y;if(a[0].x*c*o-a[0].y*s*o<0)for(let e=0;e<a.length;e++)a[e].negate();return{n,rings:r,points:i,strip:a}}function jm(e,t,n){let r=Om(e,t),i=Array(t.length);for(let a=0;a<t.length;a++)i[a]=r[a*e.length+n].toArray();return i}var Mm=new W,Nm=new W,Pm=new W,Fm=new W,Im=new W;function Lm(e,t,n){for(let r=0;r<e.length;r++){let i=e[r];if(t>=i.stationFrom&&t<i.stationTo&&n>=i.edgeFrom&&n<i.edgeTo)return!0}return!1}function Rm(e,t,n=[]){let{n:r,rings:i,points:a,strip:o}=Am(e,t),s=[],c=[],l=[],u=(e,t)=>(s.push(e.x,e.y,e.z),c.push(t.x,t.y,t.z),s.length/3-1),d=new Int32Array(i*r),f=new Int32Array(i*r);for(let t=0;t<i;t++)for(let n=0;n<r;n++){let i=a[t*r+n],s=o[t*r+(n-1+r)%r],c=o[t*r+n];if(e[n].length>2&&e[n][2])d[t*r+n]=u(i,s),f[t*r+n]=u(i,c);else{Im.copy(s).add(c).normalize();let e=u(i,Im);d[t*r+n]=e,f[t*r+n]=e}}let p=0;for(let e=0;e<i-1;e++)for(let t=0;t<r;t++){if(Lm(n,e,t))continue;let i=(t+1)%r,a=f[e*r+t],c=d[e*r+i],u=d[(e+1)*r+i],m=f[(e+1)*r+t];l.push(a,c,u,a,u,m),Mm.fromArray(s,c*3).sub(Pm.fromArray(s,a*3)),Nm.fromArray(s,u*3).sub(Pm),p+=Pm.crossVectors(Mm,Nm).dot(o[e*r+t])>=0?1:-1}if(p<0)for(let e=0;e<l.length;e+=3){let t=l[e+1];l[e+1]=l[e+2],l[e+2]=t}zm(a,r,i,0,l,u),zm(a,r,i,i-1,l,u);let m=new Tr;return m.setAttribute(`position`,new pr(s,3)),m.setAttribute(`normal`,new pr(c,3)),m.setIndex(l),m}function zm(e,t,n,r,i,a){let o=r===0?Math.min(1,n-1):Math.max(n-2,0);Fm.set(0,0,0);for(let n=0;n<t;n++)Fm.add(e[r*t+n]);Fm.divideScalar(t),Im.set(0,0,0);for(let n=0;n<t;n++)Im.add(Mm.copy(e[r*t+n]).sub(e[o*t+n]));Im.normalize();let s=a(Fm,Im),c=Array(t);for(let n=0;n<t;n++)c[n]=a(e[r*t+n],Im);Mm.copy(e[r*t]).sub(Fm),Nm.copy(e[r*t+1]).sub(Fm);let l=Pm.crossVectors(Mm,Nm).dot(Im)>=0;for(let e=0;e<t;e++){let n=(e+1)%t;l?i.push(s,c[e],c[n]):i.push(s,c[n],c[e])}}var Bm=new W,Vm=new W,Hm=new W,Um=new W;function Wm(e,t,n){if(!n||n.length===0)return null;let{n:r,points:i,strip:a}=Am(e,t),o=[],s=[],c=(e,t)=>i[e*r+t%r],l=new W,u=new W,d=new W,f=new W,p=new W,m=new W,h=(e,t,n,i)=>(n>e.edgeFrom&&n<e.edgeTo?Um.copy(a[t*r+n-1]).add(a[t*r+n]).normalize():Um.copy(a[t*r+(n===e.edgeFrom?e.edgeFrom:e.edgeTo-1)]),i.copy(c(t,n)).addScaledVector(Um,-e.depth));for(let e=0;e<n.length;e++){let t=n[e];m.set(0,0,0);let i=0;for(let e=t.stationFrom;e<=t.stationTo;e++)for(let n=t.edgeFrom;n<=t.edgeTo;n++)m.add(h(t,e,n,l)),i++;m.divideScalar(i);for(let e=t.stationFrom;e<t.stationTo;e++)for(let n=t.edgeFrom;n<t.edgeTo;n++)h(t,e,n,l),h(t,e,n+1,u),h(t,e+1,n+1,d),h(t,e+1,n,f),p.copy(l).add(a[e*r+n]),Gm(o,s,l,u,d,f,p);for(let e=0;e<2;e++){let n=e===0?t.edgeFrom:t.edgeTo;for(let e=t.stationFrom;e<t.stationTo;e++)l.copy(c(e,n)),u.copy(c(e+1,n)),h(t,e+1,n,d),h(t,e,n,f),Gm(o,s,l,u,d,f,m)}for(let e=0;e<2;e++){let n=e===0?t.stationFrom:t.stationTo;for(let e=t.edgeFrom;e<t.edgeTo;e++)l.copy(c(n,e)),u.copy(c(n,e+1)),h(t,n,e+1,d),h(t,n,e,f),Gm(o,s,l,u,d,f,m)}}let g=new Tr;return g.setAttribute(`position`,new pr(o,3)),g.setAttribute(`normal`,new pr(s,3)),g}function Gm(e,t,n,r,i,a,o){Km(e,t,n,r,i,o),Km(e,t,n,i,a,o)}function Km(e,t,n,r,i,a){Bm.copy(r).sub(n),Vm.copy(i).sub(n),Um.crossVectors(Bm,Vm).normalize();let o=Um.dot(Hm.copy(a).sub(n))<0;o&&Um.negate();let s=o?[n,i,r]:[n,r,i];for(let n=0;n<3;n++)e.push(s[n].x,s[n].y,s[n].z),t.push(Um.x,Um.y,Um.z)}var qm=new q,Jm=new W;function Ym(e){let t=Array(e.length);for(let n=0;n<e.length;n++){let r=e[n];t[n]=r.length>2?[-r[0],r[1],r[2]]:[-r[0],r[1]]}return t}function Xm(e,t){let[n,r,i]=e.radii,a=Array(e.stations.length);for(let o=0;o<e.stations.length;o++){let s=e.stations[o];a[o]={z:s.z*i,offset:[s.offset[0]*n*t,s.offset[1]*r],scale:[s.scale[0]*n,s.scale[1]*r],roll:(s.roll||0)*t}}return a}function Zm(e){let t=$.player.rider.machine;Qm(t.fairing,e),th(t.screen,e.screenPanel,e.neonLeft)}function Qm(e,t){$m(e.wing,t,1),$m(e.wing,t,-1),$m(e.nose,t,1)}function $m(e,t,n){let r=n<0?Ym(e.section):e.section,i=Xm(e,n),a=e.vents||[],o=cf(n,e.offset,e.rotation,qm);t.paint.add(Rm(r,i,a),o);let s=Wm(r,i,a);s&&t.vent.add(s,cf(n,e.offset,e.rotation,qm)),e.trim&&eh(t.neonLeft,e,r,i,n)}function eh(e,t,n,r,i){let a=t.trim,o=jm(n,r,a.crease),s=cf(i,t.offset,t.rotation,qm);for(let e=0;e<o.length;e++)o[e]=Jm.fromArray(o[e]).applyMatrix4(s).toArray();for(let t=0;t<o.length-1;t++)sf(e,o[t],o[t+1],a.radius,a.radialSegments),t>0&&e.add(new ra(a.radius,a.radialSegments,4),cf(1,o[t],null,qm))}function th(e,t,n){let r=new ra(1,e.segments[0],e.segments[1]);r.scale(e.radii[0],e.radii[1],e.radii[2]),t.add(r,cf(1,e.offset,e.rotation,qm));let i=e.edge,a=new ia(1,i.tube,i.segments[1],i.segments[0]);a.scale(e.radii[0],e.radii[1],1),n.add(a,cf(1,e.offset,e.rotation,qm))}var nh=new q,rh=new an,ih=new Dt,ah=new W(1,1,1),oh=new W;function sh(e,t,n){return{geometry:uf(e,t),matrix:lf(n,[1,0,0],nh.clone())}}function ch(e,t){let{frame:n,dark:r,rubber:i,lowerNeon:a}=e,o=sh(t.tyre,t.segments,t.centre);i.add(o.geometry,o.matrix);let s=sh(t.rim,t.segments,t.centre);n.add(s.geometry,s.matrix);let c=t.hub;r.add(new Ui(c.radius,c.radius,c.halfWidth*2,c.segments,1),lf(t.centre,[1,0,0],nh)),lh(r,t);let l=t.disc;for(let e of[1,-1]){let n=l.halfThickness,i=sh([[l.innerRadius,n],[l.outerRadius,n],[l.outerRadius,-n],[l.innerRadius,-n],[l.innerRadius,n]],l.segments,[t.centre[0]+l.x*e,t.centre[1],t.centre[2]]);r.add(i.geometry,i.matrix);let a=t.caliper,o=new X(a.size[0],a.size[1],a.size[2]);r.add(o,cf(e,a.offset,a.rotation,nh))}let u=t.glow;a.add(uf([[u.radius,u.halfWidth],[u.radius+u.width,u.halfWidth],[u.radius+u.width,-u.halfWidth],[u.radius,-u.halfWidth]],u.segments),lf(t.centre,[1,0,0],nh))}function lh(e,t){let n=t.spokes,r=n.outerRadius-n.innerRadius,i=(n.outerRadius+n.innerRadius)/2;for(let a=0;a<n.count;a++){let o=a/n.count*Math.PI*2,s=new Ui(n.outerWidth/2,n.innerWidth/2,r,4,1);s.rotateY(Math.PI/4),s.scale(1,1,n.thickness/(n.innerWidth/2)*.5),rh.set(o,0,0,`XYZ`),ih.setFromEuler(rh),oh.set(t.centre[0],t.centre[1]+Math.cos(o)*i,t.centre[2]+Math.sin(o)*i),e.add(s,nh.compose(oh,ih,ah))}}var uh=new q;function dh(e,t){return[e[0]*t,e[1],e[2]]}function fh(e){let t=$.player.rider.machine.lower;t&&(ph(e.frame,e.dark,t.fork),mh(e.lowerPaint,e.lowerNeon,e.dark,t.fender),ch(e,t.wheel))}function ph(e,t,n){for(let r of[1,-1]){let i=n.stanchion;sf(t,dh(i.from,r),dh(i.to,r),i.radius,i.radialSegments);let a=n.slider;sf(t,dh(a.from,r),dh(a.to,r),a.radius,a.radialSegments);let o=n.seal,s=new Ui(o.radius,o.radius,o.length,o.segments,1);e.add(s,lf(dh(o.offset,r),[a.to[0]-a.from[0],a.to[1]-a.from[1],a.to[2]-a.from[2]],uh));let c=n.lug;sf(t,dh(c.from,r),dh(c.to,r),c.radius,c.radialSegments,c.endRadius);let l=n.axleStub;sf(t,[l.from*r,c.to[1],c.to[2]],[l.to*r,c.to[1],c.to[2]],l.radius,l.segments)}}function mh(e,t,n,r){e.add(hh(r,r.section,0),uh.identity()),n.add(hh(r,r.section,-r.thickness,!0),uh.identity());let i=r.section[(r.section.length-1)/2],a=r.seam;t.add(hh(r,[[-a.width/2,i[1]+a.lift,1],[0,i[1]+a.lift+.001,1],[a.width/2,i[1]+a.lift,1]],0),uh.identity());let o=r.stay;for(let e of[1,-1])sf(n,dh(o.from,e),dh(o.to,e),o.radius,o.radialSegments)}function hh(e,t,n,r=!1){let i=[];for(let e=0;e<t.length;e++){let[r,a,o]=t[e];i.push([r,a+n]),o&&e>0&&e<t.length-1&&i.push([r,a+n])}let a=e.segments+1,o=i.length,s=new Float32Array(a*o*3),c=new Float32Array(a*o*3),l=[];for(let t=0;t<a;t++){let n=e.thetaStart+e.thetaLength*(t/e.segments),r=Math.sin(n),a=Math.cos(n);for(let n=0;n<o;n++){let[c,l]=i[n],u=e.radius+l,d=(t*o+n)*3;s[d]=e.centre[0]+c,s[d+1]=e.centre[1]+r*u,s[d+2]=e.centre[2]+a*u}}for(let t=0;t<e.segments;t++)for(let e=0;e<o-1;e++){let n=t*o+e,i=n+1,a=n+o,s=a+1;r?l.push(n,i,a,i,s,a):l.push(n,a,i,i,a,s)}let u=new Tr;return u.setAttribute(`position`,new Y(s,3)),u.setAttribute(`normal`,new Y(c,3)),u.setIndex(l),u.computeVertexNormals(),u}var gh=new q;function _h(e,t){return[e[0]*t,e[1],e[2]]}function vh(e){let t=$.player.rider.machine;t.tank.visible!==!1&&yh(e.tank,e.neonLeft,t.tank),bh(e.frame,t),t.lowerFront&&fh(e)}function yh(e,t,n){let[r,i,a]=n.radii,o=n.stations.map(e=>({z:e.z*a,offset:[e.offset[0]*r,e.offset[1]*i],scale:[e.scale[0]*r,e.scale[1]*i]}));e.add(Rm(n.section,o),cf(1,n.offset,n.rotation,gh));let s=n.cap;e.add(new Ui(s.radius,s.radius*.92,s.height,s.segments),cf(1,[n.offset[0]+s.offset[0],n.offset[1]+s.offset[1],n.offset[2]+s.offset[2]],n.rotation,gh));let c=n.seam;t.add(new X(c.size[0],c.size[1],c.size[2]),cf(1,[n.offset[0]+c.offset[0],n.offset[1]+c.offset[1],n.offset[2]+c.offset[2]],n.rotation,gh))}function bh(e,t){let n=t.tripleClamp;e.add(new X(n.size[0],n.size[1],n.size[2]),cf(1,n.offset,null,gh));let r=t.forkTop;for(let n=0;n<2;n++){let i=n===0?1:-1;e.add(new ra(r.radius,r.radialSegments,6),cf(i,r.from,null,gh)),!t.lowerFront&&sf(e,_h(r.from,i),_h(r.to,i),r.radius,r.radialSegments)}t.lowerFront&&(xh(e,t.headlight),Sh(e,t.cowl))}function xh(e,t){cf(1,t.offset,t.rotation,gh);let n=uf(t.profile,t.segments);n.rotateX(Math.PI/2),e.add(n,gh);let r=new Ui(t.rimRadius,t.rimRadius,t.rimWidth,t.rimSegments,1,!0);r.rotateX(Math.PI/2),r.translate(0,0,t.rimDepth),e.add(r,gh)}function Sh(e,t){cf(1,t.offset,t.rotation,gh);let n=uf(t.profile,t.segments);n.rotateX(Math.PI/2),e.add(n,gh);let r=t.lip,i=new Ui(r.radius,r.radius,r.width,r.segments,1,!0);i.rotateX(Math.PI/2),i.translate(0,0,r.depth),e.add(i,gh)}var Ch=new W(0,1,0),wh=new W,Th=new W,Eh=new W,Dh=new W,Oh=new W,kh=new W,Ah=new W,jh=new q,Mh=new q().makeScale(-1,1,1);function Nh(e,t,n=new q){return Dh.fromArray(e.from),Oh.fromArray(e.to),wh.copy(Oh).sub(Dh).normalize(),Eh.crossVectors(wh,Ch).normalize(),Th.crossVectors(Eh,wh),kh.copy(Dh).lerp(Oh,e.along),n.makeBasis(wh,Th,Eh).setPosition(kh),cf(1,e.offset,e.rotation,jh),e.scale!==1&&jh.scale(Ah.setScalar(e.scale)),n.multiply(jh),t===-1&&n.premultiply(Mh),n}function Ph(e,n){e.name=n,e.colorSpace=Le,e.anisotropy=4,e.wrapS=t,e.wrapT=t}var Fh=new Dt,Ih=new Dt;function Lh(e,t){let n=$.player.rider.hand.sprite,r=new Cn;r.name=`Hands`;let i=new na(1,1),a=new Ha,o=[],s=a.load(n.url.glove,e=>{let t=e.image.width/e.image.height;for(let e=0;e<o.length;e++)o[e].aspect=t,o[e].mesh.visible=!0});Ph(s,`glove-right`);let c=a.load(n.url.gloveBrake);Ph(c,`glove-right-brake`);for(let t of[1,-1]){let a=t===-1,l=new ni({map:s,transparent:!0,depthWrite:!1,toneMapped:!1,fog:!1,side:a?2:0});l.name=a?`RiderGloveLeft`:`RiderGloveRight`;let u=new mi(i,l);u.name=`Rider_glove`,u.frustumCulled=!1,u.visible=!1,u.renderOrder=n.renderOrder;let d=Nh(e,1,new q),f=n.offset;u.position.setFromMatrixPosition(d),u.position.x=u.position.x*t+f[0]*t,u.position.y+=f[1],u.position.z+=f[2];let p={mesh:u,material:l,aspect:1,side:t,mirrored:a,rest:u.position.clone()};o.push(p),r.add(u),t===1&&(p.neutralMap=s,p.brakeMap=c,p.braking=!1)}return{group:r,meshes:o.map(e=>e.mesh),update(e,n){let r=$.player.rider.hand.sprite,i=n&&n.input;Ih.copy(t.steering.quaternion).invert(),Ih.slerp(Fh,r.followSteer);let a=i?i.brake:0;for(let e=0;e<o.length;e++){let n=o[e],i=r.width*t.framing.handScale;if(n.mesh.quaternion.copy(Ih),n.mesh.scale.set(n.mirrored?-i:i,i/n.aspect,1),n.mesh.position.set(n.rest.x-t.framing.handInset*n.side,n.rest.y,n.rest.z),n.side!==1)continue;let s=r.brake;(n.braking?a<s.off:a>s.on)&&(n.braking=!n.braking,n.material.map=n.braking?n.brakeMap:n.neutralMap,n.material.needsUpdate=!0)}},dispose(){i.dispose();for(let e=0;e<o.length;e++)o[e].material.dispose();s.dispose(),c.dispose(),r.clear()}}}function Rh(e,t){return Lh(e,t)}var zh=`ui-monospace, Consolas, "DejaVu Sans Mono", monospace`;function Bh(e,t){let n=$.player.rider.instruments,r=n.colors,i=e.canvas.width,a=e.canvas.height;e.clearRect(0,0,i,a),e.fillStyle=r.background,e.fillRect(0,0,i,a),e.strokeStyle=r.border,e.lineWidth=3,e.strokeRect(1.5,1.5,i-3,a-3),qh(e,n,t),Kh(e,n,t),Hh(e,n,t),Wh(e,n,t),Gh(e,n,t)}function Vh(e,t){return Math.PI*(e.sweep[0]+(e.sweep[1]-e.sweep[0])*t)}function Hh(e,t,n){let r=t.tach,i=t.colors,[a,o]=r.centre;e.lineCap=`round`,e.strokeStyle=i.rpmOff,e.lineWidth=r.width,e.beginPath(),e.arc(a,o,r.radius,Vh(r,0),Vh(r,1)),e.stroke(),e.lineCap=`butt`;let s=r.redlineAt/r.maxRpm;e.strokeStyle=i.redline,e.beginPath(),e.arc(a,o,r.radius,Vh(r,s),Vh(r,1)),e.stroke();let c=Math.max(1,Math.round(n.rpm*r.fillSlices));for(let t=0;t<c;t++){let n=t/r.fillSlices,s=(t+1)/r.fillSlices;e.strokeStyle=Uh(i,n),e.beginPath(),e.arc(a,o,r.radius,Vh(r,n),Vh(r,s)+.004),e.stroke()}e.strokeStyle=i.tick,e.lineCap=`butt`;let l=r.radius-r.width*.5,u=r.radius+r.width*.5;for(let t=0;t<=r.maxRpm;t++){let n=t%2==0,s=Vh(r,t/r.maxRpm),c=Math.cos(s),d=Math.sin(s);if(e.lineWidth=n?3:2,e.beginPath(),e.moveTo(a+c*l,o+d*l),e.lineTo(a+c*(n?u:l+r.width*.45),o+d*(n?u:l+r.width*.45)),e.stroke(),!n||t===0||t===r.maxRpm)continue;let f=l-19;e.fillStyle=i.label,e.font=`700 16px `+zh,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(String(t),a+c*f,o+d*f)}e.fillStyle=i.label,e.font=`600 13px `+zh,e.textAlign=`left`,e.textBaseline=`alphabetic`,e.fillText(t.labels.rpm,14,e.canvas.height-12)}function Uh(e,t){return t>.82?e.rpmHigh:t>.55?e.rpmMid:e.rpmLow}function Wh(e,t,n){let r=t.colors,[i]=t.tach.centre,a=t.gear.y;e.textAlign=`center`,e.textBaseline=`middle`;let o=n.gear===0;e.fillStyle=o?r.neutral:r.gear,e.font=`700 `+t.gear.size+`px ui-monospace, Consolas, "DejaVu Sans Mono", monospace`,e.fillText(o?t.labels.neutral:String(n.gear),i,a)}function Gh(e,t,n){let r=t.colors,[i]=t.tach.centre,a=t.speed.y;e.textBaseline=`alphabetic`,e.textAlign=`right`,e.fillStyle=r.speed,e.font=`700 `+t.speed.size+`px ui-monospace, Consolas, "DejaVu Sans Mono", monospace`;let o=String(n.speed);e.fillText(o,i+t.speed.split,a),e.textAlign=`left`,e.fillStyle=r.label,e.font=`600 14px `+zh,e.fillText(t.labels.unit,i+t.speed.split+6,a)}function Kh(e,t,n){let r=t.shift,i=t.colors,a=e.canvas.width*.5-r.width*.5;e.fillStyle=n.shift?i.shiftOn:i.shiftOff,e.beginPath(),e.roundRect(a,r.y,r.width,r.height,r.height*.5),e.fill()}function qh(e,t,n){let r=t.colors;for(let i=0;i<t.lamps.length;i++){let a=t.lamps[i],o=(a.kind===`neutral`?n.gear===0:a.kind===`beam`)?r[a.kind]:r.lampOff;e.save(),e.translate(a.at[0],a.at[1]),e.fillStyle=o,e.strokeStyle=o,e.lineWidth=2,a.kind===`neutral`?Jh(e,`N`):a.kind===`beam`?Yh(e):a.kind===`oil`?Xh(e):Zh(e),e.restore()}}function Jh(e,t){e.font=`700 20px `+zh,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(t,0,1)}function Yh(e){e.beginPath(),e.arc(-2,0,8,Math.PI*.5,Math.PI*1.5),e.lineTo(-2,-8),e.fill();for(let t=-1;t<=1;t++)e.beginPath(),e.moveTo(1,t*5),e.lineTo(10,t*5),e.stroke()}function Xh(e){e.beginPath(),e.ellipse(-1,1,8,5,0,0,Math.PI*2),e.fill(),e.beginPath(),e.moveTo(-9,-1),e.lineTo(-13,-6),e.stroke(),e.beginPath(),e.arc(7,5,2.5,0,Math.PI*2),e.fill()}function Zh(e){e.beginPath(),e.arc(0,5,4.5,0,Math.PI*2),e.fill(),e.beginPath(),e.roundRect(-2,-9,4,12,2),e.fill();for(let t=0;t<2;t++)e.beginPath(),e.moveTo(3,-6+t*5),e.lineTo(8,-6+t*5),e.stroke()}var Qh=class{constructor(){let e=$.player.rider.instruments;this.canvas=document.createElement(`canvas`),this.canvas.width=e.texture.width,this.canvas.height=e.texture.height,this.ctx=this.canvas.getContext(`2d`),this.texture=new zi(this.canvas),this.texture.name=`instrument-face`,this.texture.colorSpace=Le,this.texture.anisotropy=4,this.geometry=new X(e.size[0],e.size[1],e.size[2]),this.material=new ni({map:this.texture,fog:!1,toneMapped:!1}),this.material.name=`InstrumentFace`,this.mesh=new mi(this.geometry,this.material),this.mesh.name=`Instruments`,cf(1,e.offset,e.rotation,this.mesh.matrix),this.mesh.matrix.decompose(this.mesh.position,this.mesh.quaternion,this.mesh.scale);let t=e.frameMargin;this.bezelGeometry=new X(e.size[0]+t*2,e.size[1]+t*2,e.frameDepth),this.bezelGeometry.translate(0,0,-e.frameDepth*.5),this.bezelMaterial=vm($.player.rider.materials.frame,`RiderBezel`),this.bezel=new mi(this.bezelGeometry,this.bezelMaterial),this.bezel.name=`InstrumentBezel`,this.bezel.matrix.copy(this.mesh.matrix),this.bezel.matrix.decompose(this.bezel.position,this.bezel.quaternion,this.bezel.scale),this.group=new Cn,this.group.name=`Cluster`,this.group.add(this.bezel,this.mesh),this.mesh.frustumCulled=!1,this.bezel.frustumCulled=!1,this._accumulator=0,this._shown={rpm:0,gear:-1,speed:-1,shift:!1},Bh(this.ctx,this._shown)}update(e,t){let n=$.player.rider.instruments;if(this._accumulator+=e,this._accumulator<1/n.updateHz)return;this._accumulator=0;let r=n.tach.steps,i=Math.round(Et.clamp(t.rpm||0,0,1)*r)/r,a=t.gear===void 0?1:t.gear,o=Math.round(t.speed||0),s=i>=n.tach.shiftAt,c=this._shown;(i!==c.rpm||a!==c.gear||o!==c.speed||s!==c.shift)&&(c.rpm=i,c.gear=a,c.speed=o,c.shift=s,Bh(this.ctx,c),this.texture.needsUpdate=!0)}dispose(){this.geometry.dispose(),this.bezelGeometry.dispose(),this.material.dispose(),this.bezelMaterial.dispose(),this.texture.dispose(),this.group.clear()}},$h=class{constructor(e,t){let n=$.player.rider;this.camera=e,this.framing=t,this.group=new Cn,this.group.name=`Rider`,e.add(this.group),this.steering=new Cn,this.steering.name=`RiderSteering`;let r=n.steering.pivot;this.steering.position.set(r.x,r.y,r.z),this.group.add(this.steering),this.parts=new Cn,this.parts.name=`RiderParts`,this.parts.position.set(-r.x,-r.y,-r.z),this.steering.add(this.parts),this.hardware=new Cn,this.hardware.name=`RiderHardware`,this.hardware.scale.setScalar(n.hardwareScale),this.parts.add(this.hardware),this.chassis=new Cn,this.chassis.name=`RiderChassis`,this.group.add(this.chassis);let i={frame:new Xd,dark:new Xd,mirror:new Xd,tank:new Xd,paint:new Xd,vent:new Xd,neonLeft:new Xd,rubber:new Xd,lowerPaint:new Xd,lowerNeon:new Xd,screenPanel:new Xd,mirrorMount:new Xd},a={tank:this.chassis,paint:this.chassis,vent:this.chassis,neonLeft:this.chassis,screenPanel:this.chassis,mirror:this.chassis,mirrorMount:this.chassis};Sm(i),vh(i),Zm(i),this.instruments=new Qh,this.parts.add(this.instruments.group);let o=n.materials;this.materials={frame:vm(o.frame,`RiderFrame`),dark:vm(o.dark,`RiderDark`),mirror:vm(o.mirror,`RiderMirror`),tank:vm(o.frame,`RiderTank`),paint:vm(n.machine.paint,`RiderPaint`),vent:vm(o.vent,`RiderVent`),neonLeft:ym(o.neonLeft,`RiderTankTrim`),rubber:vm(o.rubber,`RiderTyre`),lowerPaint:vm(n.machine.paint,`RiderLowerPaint`),lowerNeon:ym(o.neonLeft,`RiderFenderTrim`),screenPanel:vm(o.mirror,`RiderScreen`),mirrorMount:vm(o.frame,`RiderMirrorStalk`)},this.meshes=[];for(let e of Object.keys(i)){let t=i[e];if(t.isEmpty)continue;let n=new mi(t.build(`rider-`+e),this.materials[e]);n.name=`Rider_`+e,n.frustumCulled=!1,(a[e]||this.hardware).add(n),this.meshes.push(n)}this.hands=Rh(n.anchors.rightGrip,{steering:this.steering,framing:this.framing}),this.hardware.add(this.hands.group),this._steer=0,this._axis=new W(0,Math.cos(n.steering.rake),Math.sin(n.steering.rake)),this._axis.normalize(),this.update(0,{steer:0,speed:0,rpm:0,bob:0})}update(e,t){let n=$.player.rider;this._steer=Cu.damp(this._steer,t.steer||0,n.steering.tau,e),this.steering.quaternion.setFromAxisAngle(this._axis,-this._steer*n.steering.maxAngle);let r=Math.tan(Et.degToRad(this.framing.fov)*.5),i=1+(Math.tan(Et.degToRad(this.camera.fov)*.5)/r-1)*n.fovCompensation,a=this.framing.camera.rider,o=this.framing.riderOrigin;this.group.scale.setScalar(i),this.group.position.set(o.x+a.x,o.y+a.y-(t.bob||0)*n.bobLag,o.z+a.z),this.hands.update(e,t),this.instruments.update(e,t)}dispose(){for(let e=0;e<this.meshes.length;e++)this.meshes[e].geometry.dispose();this.meshes.length=0;for(let e of Object.keys(this.materials))this.materials[e].dispose();this.hands.dispose(),this.instruments.dispose(),this.camera.remove(this.group),this.group.clear(),this.hardware.clear(),this.chassis.clear(),this.steering.clear(),this.parts.clear(),this.camera=null}},eg=`cockpit-paint`,tg=[`uniform sampler2D uPaintMask;`,`uniform vec3 uBodyColor;`,`uniform vec3 uRimColor;`,`uniform vec3 uGlassColor;`,`uniform float uBodyStrength;`,`uniform float uRimStrength;`,`uniform float uGlassGain;`,`uniform float uShadowChroma;`,`const vec3 PAINT_LUMA = vec3(0.2126, 0.7152, 0.0722);`,``,"// Swaps the chroma of `base` for that of `tint` while keeping its exact","// luminance, then blends by `amount`. Working relative to each pixel's own",`// luminance is what keeps a highlight a highlight and a shadow a shadow: the`,`// tint is scaled to sit at the luminance already there rather than imposing`,`// its own.`,`vec3 paintSwap(vec3 base, vec3 tint, float amount, float shadowLift) {`,`  float baseLuma = dot(base, PAINT_LUMA);`,`  float tintLuma = max(dot(tint, PAINT_LUMA), 0.0001);`,`  vec3 matched = tint * (baseLuma / tintLuma);`,`  // More chroma the darker the pixel is. Without this the whole operation is`,`  // invisible below luminance 40, which is most of this drawing.`,`  float lift = mix(shadowLift, 1.0, smoothstep(0.0, 0.45, baseLuma));`,`  vec3 painted = mix(base, matched, clamp(amount * lift, 0.0, 1.0));`,`  // Put the original luminance back, exactly. mix() above moves it slightly`,`  // and a cockpit that brightens when it is repainted is a different object.`,`  float paintedLuma = max(dot(painted, PAINT_LUMA), 0.0001);`,`  return painted * (baseLuma / paintedLuma);`,`}`].join(`
`),ng=[`#include <map_fragment>`,`{`,`  vec3 paintMask = texture2D(uPaintMask, vMapUv).rgb;`,`  // Bodywork, then the glass, then the rim on top - the rim is drawn ON the`,`  // bodywork, so it has to have the last word or the tint washes it out.`,`  diffuseColor.rgb = paintSwap(`,`    diffuseColor.rgb, uBodyColor, uBodyStrength * paintMask.r, uShadowChroma);`,`  diffuseColor.rgb = paintSwap(`,`    diffuseColor.rgb, uGlassColor, uGlassGain * paintMask.b, 1.0);`,`  diffuseColor.rgb = paintSwap(`,`    diffuseColor.rgb, uRimColor, uRimStrength * paintMask.g, 1.0);`,`}`].join(`
`);function rg(e,t){let n=$.paint,r={uPaintMask:{value:t},uBodyColor:{value:new J(16777215)},uRimColor:{value:new J(16777215)},uGlassColor:{value:new J(16777215)},uBodyStrength:{value:n.enabled?n.bodyStrength:0},uRimStrength:{value:n.enabled?n.rimStrength:0},uGlassGain:{value:n.enabled?n.glassGain:0},uShadowChroma:{value:n.shadowChroma}};return e.onBeforeCompile=e=>{Object.assign(e.uniforms,r),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+tg).replace(`#include <map_fragment>`,ng)},e.customProgramCacheKey=()=>eg,e.needsUpdate=!0,{uniforms:r,setBike(e){e&&e.paint&&(r.uBodyColor.value.set(e.paint.body),r.uRimColor.value.set(e.paint.rim),r.uGlassColor.value.set(e.paint.glass))}}}var ig=class{constructor(e,n){this.camera=e,this.framing=n;let r=$.player.cockpit;this.group=new Cn,this.group.name=`Cockpit`,e.add(this.group),this.geometry=new na(1,1);let i=new Ha;this.aspectOf=16/9,this.texture=i.load(r.url,e=>{this.aspectOf=e.image.width/e.image.height,this._place()}),this.texture.name=`cockpit`,this.texture.colorSpace=Le,this.texture.anisotropy=4,this.texture.wrapS=t,this.texture.wrapT=t,this.texture.generateMipmaps=!0,this.texture.minFilter=c,this.mask=i.load(r.maskUrl),this.mask.name=`cockpitPaintMask`,this.mask.colorSpace=``,this.mask.wrapS=t,this.mask.wrapT=t,this.mask.minFilter=c,this.mask.anisotropy=4,this.material=new ni({map:this.texture,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,fog:!1}),this.material.name=`CockpitSprite`,this.painter=rg(this.material,this.mask),this.setBike($.bike),this.mesh=new mi(this.geometry,this.material),this.mesh.name=`Cockpit_sprite`,this.mesh.frustumCulled=!1,this.mesh.renderOrder=r.renderOrder,this.mesh.visible=!1,this.group.add(this.mesh),this.instruments=new Qh,this.clusterMaterial=new ni({map:this.instruments.texture,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,fog:!1}),this.clusterMaterial.name=`CockpitCluster`,this.cluster=new mi(this.geometry,this.clusterMaterial),this.cluster.name=`Cockpit_cluster`,this.cluster.frustumCulled=!1,this.cluster.renderOrder=r.renderOrder-1,this.cluster.visible=!1,this.group.add(this.cluster),this._ready=!0,this._steer=0,this._halfWidth=0,this._pivotY=0,this._place()}setBike(e){let t=$.bikes[e]||$.bikes[$.bike];this.bike=t,this.painter.setBike(t)}_place(){if(!this._ready)return;let e=$.player.cockpit,t=this.framing.aspect;if(!Number.isFinite(t)||t<=0)return;let n=e.distance,r=Math.tan(Et.degToRad(this.camera.fov)*.5)*n,i=r*t,a=r*2*e.heightScale,o=a*this.aspectOf,s=e.offset[0]*i,c=-r+a*.5+e.offset[1]*r,[l,u,d,f]=e.screen,p=s+((l+d)*.5-.5)*o,m=c+(.5-(u+f)*.5)*a-e.sway.pivotDrop*a;this._halfWidth=i,this._pivotY=m,this.group.position.set(p,m,-n),this._pivotX=p,this.mesh.scale.set(o,a,1),this.mesh.position.set(s-p,c-m,0),this.mesh.visible=!0;let[h,g,_,v]=e.screen;this.cluster.scale.set((_-h)*o,(v-g)*a,1),this.cluster.position.set(this.mesh.position.x+((h+_)*.5-.5)*o,this.mesh.position.y+(.5-(g+v)*.5)*a,0),this.cluster.visible=!0}update(e,t){this._place();let n=$.player.cockpit.sway;this._steer=Cu.damp(this._steer,t&&t.steer||0,n.tau,e||0);let r=t&&t.lean||0,i=du(`cockpitSway`);this.group.rotation.z=-(r*n.leanRoll+this._steer*n.steerRoll)*i,this.group.position.x=this._pivotX+this._steer*n.steerShift*this._halfWidth*i,this.instruments.update(e,t)}dispose(){this.geometry.dispose(),this.material.dispose(),this.clusterMaterial.dispose(),this.texture.dispose(),this.mask.dispose(),this.instruments.dispose(),this.group.clear(),this.group.parent&&this.group.parent.remove(this.group)}},ag={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},og=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},sg=new Za(-1,1,1,-1,0,1),cg=new class extends Tr{constructor(){super(),this.setAttribute(`position`,new pr([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new pr([0,2,0,0,2,0],2))}},lg=class{constructor(e){this._mesh=new mi(cg,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,sg)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},ug=class extends og{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof pa?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ua.clone(e.uniforms),this.material=new pa({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new lg(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},dg=class extends og{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},fg=class extends og{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},pg=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new U);this._width=n.width,this._height=n.height,t=new Kt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:g}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ug(ag),this.copyPass.material.blending=0,this.timer=new no}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}dg!==void 0&&(r instanceof dg?n=!0:r instanceof fg&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new U);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},mg=class extends og{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new J}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},hg={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new J(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},gg=class e extends og{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new U(256,256):new U(e.x,e.y),this.clearColor=new J(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Kt(i,a,{type:g,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Kt(i,a,{type:g,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Kt(i,a,{type:g,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=hg;this.highPassUniforms=ua.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new pa({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new U(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new W(1,1,1),new W(1,1,1),new W(1,1,1),new W(1,1,1),new W(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=ua.clone(ag.uniforms),this.blendMaterial=new pa({uniforms:this.copyUniforms,vertexShader:ag.vertexShader,fragmentShader:ag.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new J,this._oldClearAlpha=1,this._basic=new ni,this._fsQuad=new lg(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new U(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new pa({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new U(.5,.5)},direction:{value:new U(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new pa({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};gg.BlurDirectionX=new U(1,0),gg.BlurDirectionY=new U(0,1);var _g={name:`GradeShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1},uSaturation:{value:1.12},uStreakStrength:{value:0},uStreakLength:{value:.12},uStreakStart:{value:.34},uFlashColor:{value:new J(16777215)},uFlashAmount:{value:0},uFlashEdge:{value:0},uAberration:{value:.0015},uAberrationPower:{value:2.6},uVignetteStrength:{value:.34},uVignetteStart:{value:.45}},vertexShader:`
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uSaturation;
    uniform float uStreakStrength;
    uniform float uStreakLength;
    uniform float uStreakStart;
    uniform vec3 uFlashColor;
    uniform float uFlashAmount;
    uniform float uFlashEdge;
    uniform float uAberration;
    uniform float uAberrationPower;
    uniform float uVignetteStrength;
    uniform float uVignetteStart;

    varying vec2 vUv;

    #include <common>
    #include <tonemapping_pars_fragment>
    #include <dithering_pars_fragment>

    // 1.0 / distance from the centre of the frame to a corner, so the radius
    // below runs 0 at the centre to exactly 1 in the corners. That is what lets
    // the aberration and vignette settings be read as "at the corner".
    const float INV_CORNER = 1.41421356;

    // Rec.709 luma weights. three has no luminance() in <common>.
    const vec3 LUMA_REC709 = vec3(0.2126, 0.7152, 0.0722);

    void main() {
      vec2 offset = vUv - 0.5;
      float radius = length(offset) * INV_CORNER;

      // Radial split of red against blue. The power keeps the middle of the
      // frame clean; green is never moved, so nothing shifts in place.
      float shift = uAberration * pow(radius, uAberrationPower);
      vec3 color;
      color.r = texture2D(tDiffuse, vUv + offset * shift).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - offset * shift).b;

      // Radial speed streaks: smear the frame outward from the centre and keep
      // whichever is brighter. Because it is the frame being smeared, the road's
      // own neon is what streaks, so the colour is always right for free. Kept
      // inside the same uniform branch for the whole low speed range, where it
      // costs nothing.
      if (uStreakStrength > 0.001) {
        float reach = smoothstep(uStreakStart, 1.0, radius) * uStreakStrength;
        if (reach > 0.001) {
          vec3 smear = vec3(0.0);
          for (int i = 0; i < STREAK_TAPS; i++) {
            float t = float(i + 1) / float(STREAK_TAPS);
            smear += texture2D(tDiffuse, vUv - offset * (t * uStreakLength)).rgb;
          }
          smear /= float(STREAK_TAPS);
          color = mix(color, max(color, smear), reach);
        }
      }

      // Traffic events, added BEFORE the curve so even a full strength flash
      // rolls off rather than clipping the frame to a flat white rectangle.
      // uFlashEdge pushes the response out to the periphery: a near miss
      // happens several times a minute, and anything that frequent tinting the
      // whole image reads as a grade fault rather than as an event.
      float flashWeight = mix(1.0, smoothstep(0.2, 1.0, radius), uFlashEdge);
      color += uFlashColor * uFlashAmount * flashWeight;

      // The buffer is linear and unclamped, so anything the bloom piled above
      // 1.0 is still here for ACES to roll off rather than clip.
      color = ACESFilmicToneMapping(color);

      // ACES trades saturation for its highlight roll off, which costs this
      // scene the things it is actually made of: the purple pool in the sky and
      // the difference between a cyan strip and a green one. Pushing saturation
      // back up afterwards is the standard answer and the only way to keep both.
      float grey = dot(color, LUMA_REC709);
      color = mix(vec3(grey), color, uSaturation);

      color *= 1.0 - smoothstep(uVignetteStart, 1.0, radius) * uVignetteStrength;

      gl_FragColor = vec4(color, 1.0);

      #include <colorspace_fragment>
      // A tone mapped dark sky is exactly where 8 bit banding shows, and this
      // is the last chance to break it up.
      #include <dithering_fragment>
    }
  `};function vg(){return new pa({name:_g.name,defines:{STREAK_TAPS:$.postprocess.streaks.taps},uniforms:ua.clone(_g.uniforms),vertexShader:_g.vertexShader,fragmentShader:_g.fragmentShader,dithering:!0})}var yg=class{constructor(e,t,n,r=null){let i=$.postprocess;this.flash=r,this.renderer=e,this.scene=t,this.camera=n,this.composer=new pg(e),this.renderPass=new mg(t,n),this.composer.addPass(this.renderPass);let a=e.getSize(new U);this.bloom=new gg(a.clone().multiplyScalar(i.bloom.resolutionScale),i.bloom.strength,i.bloom.radius,i.bloom.threshold),this.composer.addPass(this.bloom),this.gradeMaterial=vg(),this.grade=new ug(this.gradeMaterial),this.composer.addPass(this.grade),e.info.autoReset=!1,this.setSize(window.innerWidth,window.innerHeight),this.update(0,{})}update(e,t){let n=$.postprocess,r=t.speedRatio||0;this.bloom.strength=n.bloom.strength+n.bloom.speedGain*r,this.bloom.radius=n.bloom.radius,this.bloom.threshold=n.bloom.threshold;let i=this.gradeMaterial.uniforms;i.toneMappingExposure.value=n.exposure,i.uSaturation.value=n.saturation,i.uAberration.value=n.aberration.amount+n.aberration.speedGain*r,i.uAberrationPower.value=n.aberration.power,i.uVignetteStrength.value=n.vignette.strength,i.uVignetteStart.value=n.vignette.start,this.flash?(i.uFlashColor.value.copy(this.flash.color),i.uFlashAmount.value=this.flash.amount,i.uFlashEdge.value=this.flash.edge,i.uAberration.value+=this.flash.aberrationBoost):i.uFlashAmount.value=0;let a=n.streaks;i.uStreakStrength.value=a.strength*r**+a.exponent,i.uStreakLength.value=a.length,i.uStreakStart.value=a.start}render(e){this.renderer.info.reset(),$.postprocess.enabled?this.composer.render(e):this.renderer.render(this.scene,this.camera)}setSize(e,t){let n=this.renderer.getPixelRatio();this.composer.setPixelRatio(n),this.composer.setSize(e,t);let r=$.postprocess.bloom.resolutionScale;this.bloom.setSize(Math.max(1,Math.round(e*n*r)),Math.max(1,Math.round(t*n*r)))}dispose(){this.renderer.info.autoReset=!0,this.bloom.dispose(),this.renderPass.dispose(),this.grade.dispose(),this.gradeMaterial.dispose(),this.composer.dispose(),this.renderer=null,this.scene=null,this.camera=null}},bg=class{constructor(){this.bike=Sg($.bikeStorageKey,$.bike),this.road=Sg($.themeStorageKey,$.theme),$.bikes[this.bike]||(this.bike=$.bike),this.road!==$.MIXED&&!$.themes[this.road]&&(this.road=$.theme),this._undo=null}get chosen(){return Cg($.bikeStorageKey)&&Cg($.themeStorageKey)}get startingRoad(){return this.road===$.MIXED?xg():this.road}get mixed(){return this.road===$.MIXED}setBike(e){$.bikes[e]&&(this.bike=e,wg($.bikeStorageKey,e),this.applyBike())}applyBike(){this._undo&&gu($,this._undo);let e=$.bikes[this.bike];this._undo=e&&e.patch?gu($,e.patch):null}setRoad(e){(e===$.MIXED||$.themes[e])&&(this.road=e,wg($.themeStorageKey,e))}};function xg(){let e=Object.keys($.themes);return e.includes($.theme)?$.theme:e[0]}function Sg(e,t){try{let n=window.localStorage.getItem(e);return n===null?t:n}catch{return t}}function Cg(e){try{return window.localStorage.getItem(e)!==null}catch{return!1}}function wg(e,t){try{window.localStorage.setItem(e,t)}catch{}}var Tg=class{constructor(e,t){let n=$.ui.select;this.options=t,this.items=t.items,this.index=0,this._disposed=!1,this.el=document.createElement(`div`),this.el.className=`select-screen `+(t.className||``);let r=document.createElement(`div`);r.className=`select-head`;let i=document.createElement(`h2`);i.className=`select-title`,i.textContent=t.title,r.append(i),this.body=document.createElement(`div`),this.body.className=`select-body`;let a=document.createElement(`div`);a.className=`select-foot`,this.hint=document.createElement(`p`),this.hint.className=`select-hint`,this.hint.textContent=matchMedia(`(hover: none)`).matches?n.hintTouch:n.hintKeys,this.backButton=null,t.onBack&&(this.backButton=this._button(n.back,`select-back`,()=>t.onBack()),a.append(this.backButton)),a.append(this.hint),this.confirmButton=this._button(t.confirmLabel||n.next,`select-confirm`,()=>this._confirm()),a.append(this.confirmButton),this.el.append(r,this.body,a),e.appendChild(this.el),this._onKey=this._onKey.bind(this),this._onPointerDown=this._onPointerDown.bind(this),this._onPointerUp=this._onPointerUp.bind(this),this.el.addEventListener(`pointerdown`,this._onPointerDown),this.el.addEventListener(`pointerup`,this._onPointerUp),window.addEventListener(`keydown`,this._onKey,!0),this._swipeFrom=null}_button(e,t,n){let r=document.createElement(`button`);return r.type=`button`,r.className=`controls-btn `+t,r.textContent=e,r.addEventListener(`pointerdown`,e=>e.stopPropagation()),r.addEventListener(`click`,e=>{e.stopPropagation(),n()}),r}select(e){let t=this.items.length;this.index=(e%t+t)%t,this.render(),this.options.onChange&&this.options.onChange(this.items[this.index],this.index)}move(e){this.select(this.index+e)}get current(){return this.items[this.index]}_confirm(){let e=this.current;e.locked||this.options.onConfirm(e)}_onKey(e){if(!this._disposed){if(e.key===`ArrowLeft`||e.key===`ArrowUp`)this.move(-1);else if(e.key===`ArrowRight`||e.key===`ArrowDown`)this.move(1);else if(e.key===`Enter`||e.key===` `)this._confirm();else if(e.key===`Escape`&&this.options.onBack)this.options.onBack();else return;e.preventDefault(),e.stopPropagation()}}_onPointerDown(e){e.stopPropagation(),this._swipeFrom={x:e.clientX,y:e.clientY}}_onPointerUp(e){if(e.stopPropagation(),!this._swipeFrom)return;let t=e.clientX-this._swipeFrom.x,n=e.clientY-this._swipeFrom.y;this._swipeFrom=null,Math.abs(t)>40&&Math.abs(t)>Math.abs(n)&&this.move(t<0?1:-1)}render(){this.confirmButton.disabled=!!(this.current&&this.current.locked)}dispose(){this._disposed=!0,this.el.removeEventListener(`pointerdown`,this._onPointerDown),this.el.removeEventListener(`pointerup`,this._onPointerUp),window.removeEventListener(`keydown`,this._onKey,!0),this.el.parentNode&&this.el.parentNode.removeChild(this.el),this.el=null}},Eg=class{constructor(e,t,n){let r=$.ui.bikes,i=Object.keys($.bikes),a=i.map(e=>({key:e,bike:$.bikes[e]}));this.screen=new Tg(e,{title:r.title,className:`bike-screen`,items:a,onBack:t.onBack,onChange:e=>t.onPreview(e.key),onConfirm:e=>t.onConfirm(e.key)}),this._build();let o=Math.max(0,i.indexOf(n));this.screen.select(o)}_build(){let e=$.ui.bikes,t=this.screen.body;this.name=document.createElement(`div`),this.name.className=`bike-name`,this.blurb=document.createElement(`p`),this.blurb.className=`bike-blurb`;let n=document.createElement(`div`);n.className=`bike-bars`,this.bars={};for(let[t,r]of[[`speed`,e.speed],[`acceleration`,e.acceleration],[`handling`,e.handling]]){let e=document.createElement(`div`);e.className=`bike-bar`;let i=document.createElement(`span`);i.className=`bike-bar-label`,i.textContent=r;let a=document.createElement(`span`);a.className=`bike-bar-track`;let o=document.createElement(`span`);o.className=`bike-bar-fill`,a.append(o),e.append(i,a),n.append(e),this.bars[t]=o}this.dots=document.createElement(`div`),this.dots.className=`select-dots`,t.append(this.name,n,this.blurb,this.dots);let r=this.screen.render.bind(this.screen);this.screen.render=()=>{r(),this._render()}}_render(){let e=this.screen.current,t=e.bike,n=$.ui.bikes;this.name.textContent=t.name,this.blurb.textContent=n.blurb&&n.blurb[e.key]||``,this.screen.el.style.setProperty(`--bike-rim`,`#`+t.paint.rim.toString(16).padStart(6,`0`)),this.screen.el.style.setProperty(`--bike-body`,`#`+t.paint.body.toString(16).padStart(6,`0`));for(let e of Object.keys(this.bars))this.bars[e].style.width=Math.round((t.bars[e]||0)*100)+`%`;this.dots.textContent=``,this.screen.items.forEach((e,t)=>{let n=document.createElement(`span`);n.className=`select-dot`+(t===this.screen.index?` select-dot-on`:``),this.dots.append(n)})}dispose(){this.screen.dispose()}},Dg=class{constructor(e,t,n){let r=$.ui.roads,i=[];for(let e of Object.keys($.themes))i.push({key:e,label:r.name&&r.name[e]||$.themes[e].name,blurb:r.blurb&&r.blurb[e]||``,thumb:`thumbs/${e}.jpg`,locked:!1});Object.keys($.themes).length>1&&i.push({key:$.MIXED,label:r.mixed,blurb:r.mixedBlurb,thumb:``,mixed:!0,locked:!1});for(let e of $.plannedThemes)$.themes[e.key]||i.push({key:e.key,label:e.name,blurb:``,locked:!0});this.screen=new Tg(e,{title:r.title,className:`road-screen`,confirmLabel:$.ui.select.start,items:i,onBack:t.onBack,onChange:e=>{this._render(),t.onPreview&&!e.locked&&t.onPreview(e.key)},onConfirm:e=>t.onConfirm(e.key)}),this._build();let a=Math.max(0,i.findIndex(e=>e.key===n));this.screen.select(a)}_build(){let e=this.screen.body;this.grid=document.createElement(`div`),this.grid.className=`road-grid`,this.cards=this.screen.items.map((e,t)=>{let n=document.createElement(`button`);n.type=`button`,n.className=`road-card`+(e.locked?` road-card-locked`:``)+(e.mixed?` road-card-mixed`:``);let r=document.createElement(`span`);r.className=`road-shot`,e.thumb&&(r.style.backgroundImage=`url(${e.thumb})`);let i=document.createElement(`span`);if(i.className=`road-label`,i.textContent=e.label,n.append(r,i),e.locked){let e=document.createElement(`span`);e.className=`road-lock`,e.textContent=$.ui.select.locked,n.append(e),n.disabled=!0}return n.addEventListener(`pointerdown`,e=>e.stopPropagation()),n.addEventListener(`click`,n=>{n.stopPropagation(),this.screen.index===t&&!e.locked?this.screen.options.onConfirm(e):this.screen.select(t)}),this.grid.append(n),n}),this.blurb=document.createElement(`p`),this.blurb.className=`road-blurb`,e.append(this.grid,this.blurb);let t=this.screen.render.bind(this.screen);this.screen.render=()=>{t(),this._render()}}_render(){if(!this.cards)return;this.cards.forEach((e,t)=>{e.classList.toggle(`road-card-on`,t===this.screen.index)});let e=this.screen.current;this.blurb.textContent=e.locked?``:e.blurb;let t=this.cards[this.screen.index];t&&t.scrollIntoView&&t.scrollIntoView({block:`nearest`,inline:`nearest`})}dispose(){this.screen.dispose()}},Og=class{constructor(e,t,n){this.parent=e,this.selection=t,this.handlers=n,this.screen=null,this._roadOnEntry=t.road}start(){this._roadOnEntry=this.selection.road,this._showBike()}get open(){return!!this.screen}_clear(){this.screen&&this.screen.dispose(),this.screen=null}_showBike(){this._clear(),this.screen=new Eg(this.parent,{onPreview:e=>{this.handlers.onBikePreview(e)},onConfirm:e=>{this.selection.setBike(e),this._showRoad()}},this.selection.bike)}_showRoad(){this._clear(),this.screen=new Dg(this.parent,{onBack:()=>{this.handlers.onRoadPreview(this._roadOnEntry),this._showBike()},onPreview:e=>this.handlers.onRoadPreview(e),onConfirm:e=>{this.selection.setRoad(e),this._clear(),this.handlers.onDone()}},this.selection.road)}quickStart(){this._clear(),this.handlers.onDone()}dispose(){this._clear()}},kg=new J,Ag=new J,jg=new J;function Mg(e){return/(^color)|(color$)/i.test(e)}function Ng(e){let t=gu($,e),n=JSON.parse(JSON.stringify({sky:$.sky,world:$.world}));return gu($,t),n}function Pg(e,t,n,r){for(let i of Object.keys(n)){let a=n[i],o=t?t[i]:void 0;if(Array.isArray(a)){if(!Array.isArray(e[i]))continue;for(let t=0;t<a.length&&t<e[i].length;t++){let n=Array.isArray(o)?o[t]:void 0;a[t]!==null&&typeof a[t]==`object`?Pg(e[i][t],n,a[t],r):typeof a[t]==`number`&&typeof n==`number`?e[i][t]=n+(a[t]-n)*r:e[i][t]=a[t]}continue}if(typeof a==`object`&&a){if(e[i]===null||typeof e[i]!=`object`)continue;Pg(e[i],o,a,r);continue}if(typeof a==`number`&&typeof o==`number`){Mg(i)?(kg.setHex(o,Le).convertSRGBToLinear(),Ag.setHex(a,Le).convertSRGBToLinear(),jg.copy(kg).lerp(Ag,r).convertLinearToSRGB(),e[i]=jg.getHex()):e[i]=o+(a-o)*r;continue}r>=.5&&(e[i]=a)}}var Fg=class{constructor(e){this.modules=e,this.from=null,this.to=null,this.name=null,this.t=1,this.duration=1,this.active=!1,this.onDone=null,this._density=Object.create(null)}start(e,t,n){let r=$.themes[t],i=$.themes[e];return!r||e===t?!1:(this.from=Ng(i||{}),this.to=Ng(r),this.name=t,this.duration=Math.max(1e-4,n),this.t=0,this.active=!0,!0)}apply(e){let t=$.themes[e];return t?(gu($,t),this.push(),!0):!1}update(e){if(!this.active)return;this.t=Math.min(1,this.t+e/this.duration);let t=this.t*this.t*(3-2*this.t);Pg({sky:$.sky,world:$.world},this.from,this.to,t),this.push(),this.t>=1&&(this.active=!1,this.onDone&&this.onDone(this.name))}push(){let e=this.modules;if(e.sky&&e.sky.applyTheme(),e.roadMaterial&&e.roadMaterial.applyTheme(),e.roadside&&e.roadside.applyTheme(),e.median&&e.median.applyTheme(),e.mountains&&e.mountains.applyTheme(),e.fog&&(e.fog.color.set($.world.fog.color),e.fog.density=$.world.fog.density),e.weather){let t=$.world.weather.kind;t!==e.weather.kind&&e.weather.setKind(t),e.weather.setFade(t?this.active?this.t:1:0)}if(e.scenery){let t=$.world.scenery.density,n=!1;for(let e of Object.keys(t)){let r=Math.round((t[e]||0)*100);this._density[e]!==r&&(this._density[e]=r,n=!0)}n&&e.scenery.refill()}}dispose(){this.modules={},this.from=null,this.to=null}},Ig=class{constructor(e,t){let n=$.world.gate;this.road=t,this.distance=0,this.armed=!1,this.crossed=!0,this.onCross=null;let r=Fd(),i=(r.shoulderEdge-r.oncomingOuter)*.5+n.overhang,a=(r.shoulderEdge+r.oncomingOuter)*.5;this.centre=a,this.group=new Cn,this.group.name=`ThemeGate`,this.group.visible=!1,e.add(this.group);let o=new X(n.legWidth,n.height,n.legWidth),s=new X(i*2,n.beamHeight,n.legWidth);this.geometries=[o,s],this.structureMaterial=new ni({color:n.structureColor}),this.neonMaterial=new ni({color:n.neonColor,toneMapped:!1,transparent:!0,opacity:1}),this.materials=[this.structureMaterial,this.neonMaterial];let c=new X(n.legWidth*n.legStripWidth,n.height,n.legWidth*.55);this.geometries.push(c),this.legStripMaterial=new ni({color:n.neonColor,toneMapped:!1,transparent:!0,opacity:n.legStripOpacity}),this.materials.push(this.legStripMaterial);for(let e of[-1,1]){let t=new mi(o,this.structureMaterial);t.position.set(a+e*i,n.height*.5,0),this.group.add(t);let r=new mi(c,this.legStripMaterial);r.position.set(a+e*(i-n.legWidth*.5*n.legStripWidth),n.height*.5,n.legWidth*.3),this.group.add(r)}this.beam=new mi(s,this.neonMaterial),this.beam.position.set(a,n.height,0),this.group.add(this.beam);let l=new X(i*2+n.haloSpread,n.beamHeight+n.haloSpread,n.legWidth*.5);this.geometries.push(l),this.haloMaterial=new ni({color:n.neonColor,toneMapped:!1,transparent:!0,opacity:n.haloOpacity,depthWrite:!1,blending:2}),this.materials.push(this.haloMaterial),this.halo=new mi(l,this.haloMaterial),this.halo.position.set(a,n.height,-n.legWidth*.4),this.group.add(this.halo)}arm(e){this.distance=e+$.world.gate.ahead,this.armed=!0,this.crossed=!1,this.group.visible=!0}disarm(){this.armed=!1,this.crossed=!0,this.group.visible=!1}update(e,t){if(!this.armed)return;let n=$.world.gate,r=t.distance||0,i=this.distance-r;if(i<-n.behind){this.disarm();return}let a=this.road.path,o=new W,s=new W,c=new W;a.frameAt(this.distance,o,s,c),this.group.position.copy(o),this.group.rotation.y=Math.atan2(-s.x,-s.z);let l=Et.clamp(1-(i-n.fadeStart)/Math.max(n.fadeEnd-n.fadeStart,.001),0,1);this.neonMaterial.opacity=l,this.haloMaterial.opacity=n.haloOpacity*l,this.legStripMaterial.opacity=n.legStripOpacity*l,!this.crossed&&i<=0&&(this.crossed=!0,this.onCross&&this.onCross())}dispose(){for(let e of this.geometries)e.dispose();for(let e of this.materials)e.dispose();this.group.clear(),this.group.parent&&this.group.parent.remove(this.group),this.onCross=null}},Lg=class{constructor(){this.color=new J(16777215),this.amount=0,this.edge=0,this.aberrationBoost=0,this._level=Object.create(null),this._refractory=Object.create(null);for(let e of Object.keys($.flash.sources))this._level[e]=0,this._refractory[e]=0;this._hits=0,this._nearMisses=0,this._seeded=!1,this.blocked={notRunning:0,invulnerable:0,refractory:0,disabled:0},this.fired=Object.create(null)}fire(e,t){let n=$.flash,r=n.sources[e];return r?n.enabled?r.requiresRun&&!(t&&t.scoring)?(this.blocked.notRunning++,!1):r.blockedWhileInvulnerable&&t&&(t.invulnerable||0)>0?(this.blocked.invulnerable++,!1):this._refractory[e]>0?(this.blocked.refractory++,!1):(this._level[e]=1,this._refractory[e]=r.refractory,this.fired[e]=(this.fired[e]||0)+1,!0):(this.blocked.disabled++,!1):!1}update(e,t){let n=$.flash,r=n.sources;for(let t of Object.keys(r)){let n=r[t].duration||.001;this._level[t]=Math.max(0,this._level[t]-e/n),this._refractory[t]=Math.max(0,this._refractory[t]-e)}let i=t&&t.hits||0,a=t&&t.nearMisses||0;this._seeded||=(this._hits=i,this._nearMisses=a,!0),i>this._hits&&(this._hits=i,this.fire(`collision`,t)),a>this._nearMisses&&(this._nearMisses=a,this.fire(`nearMiss`,t));let o=du(`flash`),s=null,c=0,l=-1;for(let e of Object.keys(r)){let t=this._level[e];if(t<=0)continue;let n=r[e],i=t*n.strength;(i>c||i===c&&n.priority>l)&&(s=n,c=i,l=n.priority)}s?(this.color.set(s.color),this.amount=c*n.gain*o,this.edge=s.edge):(this.amount=0,this.edge=0);let u=r.nearMiss;this.aberrationBoost=this._level.nearMiss*(u.aberrationBoost||0)*o}reset(){for(let e of Object.keys(this._level))this._level[e]=0,this._refractory[e]=0;this.amount=0,this.edge=0,this.aberrationBoost=0,this._seeded=!1}dispose(){this._level=Object.create(null),this._refractory=Object.create(null)}};new cu(document.body);var Rg=document.getElementById(`app`),zg=new lu,Bg=new URLSearchParams(location.search),Vg=new bg,Hg=Bg.get(`bike`);Hg&&$.bikes[Hg]&&(Vg.bike=Hg),Vg.applyBike();var Ug=Bg.get(`theme`);Ug===$.MIXED?Vg.road=$.MIXED:Ug&&$.themes[Ug]&&(Vg.road=Ug);var Wg=new _u($,$.themes,$.theme);Wg.select(Vg.startingRoad);var Gg=new uu,Kg=new vu(Rg),qg=new yu().update(window.innerWidth/window.innerHeight),Jg=new Cu(Rg);Kg.scene.fog=new jn($.world.fog.color,$.world.fog.density);var Yg=new Dd(Kg.scene,Kg.camera),Xg=new Wd(Kg.scene),Zg=new bf(Kg.scene,Xg),Qg=new Af(Kg.scene,Xg),$g=new Zf(Kg.scene,Xg),e_=new rp(Kg.scene,Kg.camera,Kg.renderer),t_=new dp(Kg.scene,Xg),n_=new Cf(Kg.scene),r_=new Ig(Kg.scene,Xg),i_=new Fg({sky:Yg,roadMaterial:Xg.surface,roadside:Zg,median:Qg,mountains:n_,weather:e_,scenery:$g,fog:Kg.scene.fog}),a_=new Xp(Kg.camera,Xg.path,qg),o_=$.player.cockpit.source===`sprite`?new ig(Kg.camera,qg):new $h(Kg.camera,qg),s_=new jp(Kg.scene,Xg,a_),c_=new rm(Xg.path,s_,a_),l_=new om(a_,s_),u_=null,d_=new Lg,f_=new yg(Kg.renderer,Kg.scene,Kg.camera,d_);Kg.onResize=(e,t)=>{qg.refresh(e/t),f_.setSize(e,t)};var p_=new wu((e,t)=>Kg.resize(e,t));$.viewport.fullscreen.onFirstTouchWhenCoarse&&zg.coarsePointer&&(Jg.onFirstTouch=()=>{Tu.request(),hm.request()});var m_=new hm(document.body,()=>p_),h_=new mm(zg.coarsePointer);Jg.controls=h_;var g_=new Eu(document.body);g_.setMode(h_.mode),h_.onChange=e=>g_.setMode(e),h_.onNotice=e=>g_.notice(e),u_=$.stats.enabled?new Ou(document.body,h_):null;var __=new Su(Kg.renderer,{onRender:e=>f_.render(e)});__.state.input=Jg.values,__.add((e,t)=>{Jg.update(e),t.controlMode=h_.enabled?h_.mode:void 0}),__.add((e,t)=>x_.publish(t)),__.add((e,t)=>{if(!$.autopilot.enabled){t.input=Jg.values;return}c_.update(e,t),t.input=c_.values}),__.add(e=>p_.update(e)),__.add(()=>qg.refresh(Kg.camera.aspect)),__.add((e,t)=>a_.step(e,t)),__.add((e,t)=>l_.update(e,t)),__.add((e,t)=>a_.place(e,t)),__.add((e,t)=>Xg.update(e,t)),__.add((e,t)=>n_.update(e,t)),__.add((e,t)=>s_.update(e,t)),__.add((e,t)=>t_.update(e,t)),__.add((e,t)=>e_.update(e,t)),__.add((e,t)=>o_.update(e,t)),__.add(e=>Yg.update(e)),__.add((e,t)=>r_.update(e,t)),__.add(e=>i_.update(e)),__.add((e,t)=>d_.update(e,t)),__.add((e,t)=>f_.update(e,t)),__.add((e,t)=>b_.update(e,t)),u_&&__.add((e,t)=>u_.update(e,t)),__.add(e=>{g_.update(e);let t=h_.enabled&&!$.autopilot.enabled&&!$.capture.enabled&&!j_();g_.setVisible(t),w_.setVisible(t&&x_.phase===ju.RUNNING)});function v_(){u_&&u_.setVisible(!($.capture.enabled&&$.capture.hideOverlay)),g_.setVisible(!$.autopilot.enabled&&!$.capture.enabled),Kg.resize(p_.width,p_.height)}new bu({capture:()=>{$.capture.enabled=!$.capture.enabled,v_()},cameraProfile:()=>{let e=Object.keys($.framing.profiles[0].cameras),t=(e.indexOf($.player.camera.profile)+1)%e.length;$.player.camera.profile=e[t]},overlay:()=>{u_&&u_.setVisible(!u_.visible)},fullscreen:()=>Tu.toggle(),mute:()=>{console.info(`[audio]`,b_.toggleMute()?`muted`:`unmuted`)},pause:()=>x_.togglePause(),comfort:()=>{console.info(`[comfort] reduced motion:`,Gg.toggle()?`on`:`off`)},theme:()=>{let e=Wg.names[(Wg.names.indexOf(Wg.name)+1)%Wg.names.length],t=new URL(location.href);t.searchParams.set(`theme`,e),location.href=t.toString()},quality:()=>{let e=Object.keys($.quality.presets);zg.preset=e[(e.indexOf(zg.preset)+1)%e.length],zg.apply(),Kg.resize(p_.width,p_.height),console.info(`[quality] preset:`,zg.preset,`(reload for the rest)`)}},$.input.hotkeys);function y_(e){let t=$.autopilot;return t.enabled=e===void 0?!t.enabled:!!e,t.enabled&&t.withCapture&&!$.capture.enabled&&($.capture.enabled=!0,v_()),t.enabled&&(x_.free(),__.paused=!1),t.enabled}new xu($.autopilot.reveal.sequence,$.autopilot.reveal.window,()=>y_()),window.neonRide={god:y_};var b_=new ed;u_&&(u_.audio=b_);var x_=new Mu,S_=new Fu(document.body,x_),C_=new Ru(document.body,x_,Gg,h_,b_),w_=new Du(document.body,()=>x_.togglePause());__.add((e,t)=>{x_.update(e,t),S_.update(),C_.update(),__.paused=x_.phase===ju.PAUSED,b_.setPaused(x_.phase===ju.PAUSED)});var T_=Bg.get(`god`)===`1`;m_.onChange=e=>{e?(m_.resumeOnReturn=x_.phase===ju.RUNNING,m_.resumeOnReturn&&x_.togglePause()):m_.resumeOnReturn&&x_.phase===ju.PAUSED&&(m_.resumeOnReturn=!1,x_.togglePause())};var E_=()=>{b_.unlock(s_)&&(window.removeEventListener(`pointerdown`,E_,!0),window.removeEventListener(`touchend`,E_,!0),window.removeEventListener(`keydown`,E_,!0))};window.addEventListener(`pointerdown`,E_,!0),window.addEventListener(`touchend`,E_,!0),window.addEventListener(`keydown`,E_,!0);var D_=0;function O_(e){let t=Object.keys($.themes);return t[(t.indexOf(e)+1)%t.length]}function k_(e){D_=e+$.world.gate.everyMeters}r_.onCross=()=>{let e=Wg.name,t=O_(e);i_.start(e,t,$.world.gate.blendSeconds),Wg.select(t),d_.fire(`themeGate`,__.state),k_(__.state.distance||0)},__.add((e,t)=>{if(!Vg.mixed)return;let n=t.distance||0;D_||k_(n),!r_.armed&&n>=D_-$.world.gate.ahead&&r_.arm(n)});function A_(e){let t=e===$.MIXED?Vg.startingRoad:e;$.themes[t]&&t!==Wg.name&&(i_.start(Wg.name,t,$.world.gate.blendSeconds*.5),Wg.select(t))}function j_(){return!N_.started||M_.open}var M_=new Og(document.body,Vg,{onBikePreview:e=>{o_.setBike&&o_.setBike(e)},onRoadPreview:A_,onDone:()=>{Vg.applyBike(),D_=0,P_()}}),N_=new Au(document.body,()=>{b_.start(s_),h_.mode===`tilt`&&h_.request(),T_?y_(!0):M_.start()},Gg);function P_(){x_.begin(__.state),d_.reset(),h_.enabled&&g_.banner(h_.mode)}function F_(e){if(!j_()){if(e.type===`keydown`){let t=e.key;if(t===`Shift`||t===`Control`||t===`Alt`||t===`Meta`||t===`Escape`)return}x_.phase===ju.OVER&&x_.overShown?P_():x_.phase===ju.PAUSED&&x_.togglePause()}}if(window.addEventListener(`pointerdown`,F_),window.addEventListener(`keydown`,F_),v_(),T_){y_(!0),N_.skip();let e=()=>{b_.unlock(s_),h_.mode===`tilt`&&h_.request(),window.removeEventListener(`pointerdown`,e),window.removeEventListener(`keydown`,e)};window.addEventListener(`pointerdown`,e),window.addEventListener(`keydown`,e)}var I_=Bg.get(`stats`);u_&&I_!==null&&u_.setVisible(I_!==`0`),__.start();