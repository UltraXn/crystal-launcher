import{j as p,al as q,am as be,T as Ce,y as dt,an as ut,G as ft,_ as pt,o as ht,ao as mt}from"./ui-vendor-bChcnJbH.js";import{r as A,u as gt}from"./react-vendor-C4HomasF.js";import{C as de}from"./confetti.module-Bd1oGXMM.js";import{u as xt,s as Z,g as v,L as bt}from"./index-0L0CuJC5.js";import{T as yt,b as ye,c as Be,L as Tt,d as J,e as ze,M as O,V as Ve,C as V,f as H,S as Q,g as wt,P as ne,D as Rt,h as re,i as z,j as Et,Q as Xe,k as _t,O as $e,l as At,m as Nt,B as ue,n as St,o as Ye,N as Lt,p as Mt,q as kt,r as Te,s as qe,t as we,u as It,v as Ct,w as vt,x as fe,y as jt,z as We,A as Ot,E as W,G as Dt,H as Pt,J as Ft,K as Je,U as Ht,X as Gt,Y as Ut,Z as Kt,_ as pe,$ as Qe,a0 as Bt,a1 as zt,a2 as Vt,a3 as Xt,a4 as $t,a5 as Yt,a6 as Ze,a7 as qt,a8 as ve,a9 as je,aa as Oe,ab as De,ac as Pe,ad as Wt,ae as Jt,af as et,ag as Qt,ah as Zt,ai as en,aj as tn,ak as nn,al as sn}from"./three-vendor-3xqboD54.js";import{u as rn}from"./utils-vendor-DpehPmnF.js";function Fe(u,t){if(t===yt)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),u;if(t===ye||t===Be){let e=u.getIndex();if(e===null){const r=[],o=u.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)r.push(a);u.setIndex(r),e=u.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),u}const i=e.count-2,n=[];if(t===ye)for(let r=1;r<=i;r++)n.push(e.getX(0)),n.push(e.getX(r)),n.push(e.getX(r+1));else for(let r=0;r<i;r++)r%2===0?(n.push(e.getX(r)),n.push(e.getX(r+1)),n.push(e.getX(r+2))):(n.push(e.getX(r+2)),n.push(e.getX(r+1)),n.push(e.getX(r)));n.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=u.clone();return s.setIndex(n),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),u}class an extends Tt{constructor(t){super(t),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new un(e)}),this.register(function(e){return new fn(e)}),this.register(function(e){return new wn(e)}),this.register(function(e){return new Rn(e)}),this.register(function(e){return new En(e)}),this.register(function(e){return new hn(e)}),this.register(function(e){return new mn(e)}),this.register(function(e){return new gn(e)}),this.register(function(e){return new xn(e)}),this.register(function(e){return new dn(e)}),this.register(function(e){return new bn(e)}),this.register(function(e){return new pn(e)}),this.register(function(e){return new Tn(e)}),this.register(function(e){return new yn(e)}),this.register(function(e){return new cn(e)}),this.register(function(e){return new _n(e)}),this.register(function(e){return new An(e)})}load(t,e,i,n){const s=this;let r;if(this.resourcePath!=="")r=this.resourcePath;else if(this.path!==""){const c=J.extractUrlBase(t);r=J.resolveURL(c,this.path)}else r=J.extractUrlBase(t);this.manager.itemStart(t);const o=function(c){n?n(c):console.error(c),s.manager.itemError(t),s.manager.itemEnd(t)},a=new ze(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(t,function(c){try{s.parse(c,r,function(d){e(d),s.manager.itemEnd(t)},o)}catch(d){o(d)}},i,o)}setDRACOLoader(t){return this.dracoLoader=t,this}setKTX2Loader(t){return this.ktx2Loader=t,this}setMeshoptDecoder(t){return this.meshoptDecoder=t,this}register(t){return this.pluginCallbacks.indexOf(t)===-1&&this.pluginCallbacks.push(t),this}unregister(t){return this.pluginCallbacks.indexOf(t)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(t),1),this}parse(t,e,i,n){let s;const r={},o={},a=new TextDecoder;if(typeof t=="string")s=JSON.parse(t);else if(t instanceof ArrayBuffer)if(a.decode(new Uint8Array(t,0,4))===tt){try{r[R.KHR_BINARY_GLTF]=new Nn(t)}catch(l){n&&n(l);return}s=JSON.parse(r[R.KHR_BINARY_GLTF].content)}else s=JSON.parse(a.decode(t));else s=t;if(s.asset===void 0||s.asset.version[0]<2){n&&n(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new Hn(s,{path:e||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let d=0;d<this.pluginCallbacks.length;d++){const l=this.pluginCallbacks[d](c);l.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[l.name]=l,r[l.name]=!0}if(s.extensionsUsed)for(let d=0;d<s.extensionsUsed.length;++d){const l=s.extensionsUsed[d],f=s.extensionsRequired||[];switch(l){case R.KHR_MATERIALS_UNLIT:r[l]=new ln;break;case R.KHR_DRACO_MESH_COMPRESSION:r[l]=new Sn(s,this.dracoLoader);break;case R.KHR_TEXTURE_TRANSFORM:r[l]=new Ln;break;case R.KHR_MESH_QUANTIZATION:r[l]=new Mn;break;default:f.indexOf(l)>=0&&o[l]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+l+'".')}}c.setExtensions(r),c.setPlugins(o),c.parse(i,n)}parseAsync(t,e){const i=this;return new Promise(function(n,s){i.parse(t,e,n,s)})}}function on(){let u={};return{get:function(t){return u[t]},add:function(t,e){u[t]=e},remove:function(t){delete u[t]},removeAll:function(){u={}}}}const R={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class cn{constructor(t){this.parser=t,this.name=R.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const t=this.parser,e=this.parser.json.nodes||[];for(let i=0,n=e.length;i<n;i++){const s=e[i];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&t._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(t){const e=this.parser,i="light:"+t;let n=e.cache.get(i);if(n)return n;const s=e.json,a=((s.extensions&&s.extensions[this.name]||{}).lights||[])[t];let c;const d=new V(16777215);a.color!==void 0&&d.setRGB(a.color[0],a.color[1],a.color[2],H);const l=a.range!==void 0?a.range:0;switch(a.type){case"directional":c=new Rt(d),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new ne(d),c.distance=l;break;case"spot":c=new wt(d),c.distance=l,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle!==void 0?a.spot.innerConeAngle:0,a.spot.outerConeAngle=a.spot.outerConeAngle!==void 0?a.spot.outerConeAngle:Math.PI/4,c.angle=a.spot.outerConeAngle,c.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+a.type)}return c.position.set(0,0,0),j(c,a),a.intensity!==void 0&&(c.intensity=a.intensity),c.name=e.createUniqueName(a.name||"light_"+t),n=Promise.resolve(c),e.cache.add(i,n),n}getDependency(t,e){if(t==="light")return this._loadLight(e)}createNodeAttachment(t){const e=this,i=this.parser,s=i.json.nodes[t],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(a){return i._getNodeRef(e.cache,o,a)})}}class ln{constructor(){this.name=R.KHR_MATERIALS_UNLIT}getMaterialType(){return W}extendParams(t,e,i){const n=[];t.color=new V(1,1,1),t.opacity=1;const s=e.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const r=s.baseColorFactor;t.color.setRGB(r[0],r[1],r[2],H),t.opacity=r[3]}s.baseColorTexture!==void 0&&n.push(i.assignTexture(t,"map",s.baseColorTexture,Q))}return Promise.all(n)}}class dn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(t,e){const n=this.parser.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=n.extensions[this.name].emissiveStrength;return s!==void 0&&(e.emissiveIntensity=s),Promise.resolve()}}class un{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_CLEARCOAT}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[],r=n.extensions[this.name];if(r.clearcoatFactor!==void 0&&(e.clearcoat=r.clearcoatFactor),r.clearcoatTexture!==void 0&&s.push(i.assignTexture(e,"clearcoatMap",r.clearcoatTexture)),r.clearcoatRoughnessFactor!==void 0&&(e.clearcoatRoughness=r.clearcoatRoughnessFactor),r.clearcoatRoughnessTexture!==void 0&&s.push(i.assignTexture(e,"clearcoatRoughnessMap",r.clearcoatRoughnessTexture)),r.clearcoatNormalTexture!==void 0&&(s.push(i.assignTexture(e,"clearcoatNormalMap",r.clearcoatNormalTexture)),r.clearcoatNormalTexture.scale!==void 0)){const o=r.clearcoatNormalTexture.scale;e.clearcoatNormalScale=new Ve(o,o)}return Promise.all(s)}}class fn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_DISPERSION}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const n=this.parser.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=n.extensions[this.name];return e.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class pn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_IRIDESCENCE}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[],r=n.extensions[this.name];return r.iridescenceFactor!==void 0&&(e.iridescence=r.iridescenceFactor),r.iridescenceTexture!==void 0&&s.push(i.assignTexture(e,"iridescenceMap",r.iridescenceTexture)),r.iridescenceIor!==void 0&&(e.iridescenceIOR=r.iridescenceIor),e.iridescenceThicknessRange===void 0&&(e.iridescenceThicknessRange=[100,400]),r.iridescenceThicknessMinimum!==void 0&&(e.iridescenceThicknessRange[0]=r.iridescenceThicknessMinimum),r.iridescenceThicknessMaximum!==void 0&&(e.iridescenceThicknessRange[1]=r.iridescenceThicknessMaximum),r.iridescenceThicknessTexture!==void 0&&s.push(i.assignTexture(e,"iridescenceThicknessMap",r.iridescenceThicknessTexture)),Promise.all(s)}}class hn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_SHEEN}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[];e.sheenColor=new V(0,0,0),e.sheenRoughness=0,e.sheen=1;const r=n.extensions[this.name];if(r.sheenColorFactor!==void 0){const o=r.sheenColorFactor;e.sheenColor.setRGB(o[0],o[1],o[2],H)}return r.sheenRoughnessFactor!==void 0&&(e.sheenRoughness=r.sheenRoughnessFactor),r.sheenColorTexture!==void 0&&s.push(i.assignTexture(e,"sheenColorMap",r.sheenColorTexture,Q)),r.sheenRoughnessTexture!==void 0&&s.push(i.assignTexture(e,"sheenRoughnessMap",r.sheenRoughnessTexture)),Promise.all(s)}}class mn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_TRANSMISSION}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[],r=n.extensions[this.name];return r.transmissionFactor!==void 0&&(e.transmission=r.transmissionFactor),r.transmissionTexture!==void 0&&s.push(i.assignTexture(e,"transmissionMap",r.transmissionTexture)),Promise.all(s)}}class gn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_VOLUME}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[],r=n.extensions[this.name];e.thickness=r.thicknessFactor!==void 0?r.thicknessFactor:0,r.thicknessTexture!==void 0&&s.push(i.assignTexture(e,"thicknessMap",r.thicknessTexture)),e.attenuationDistance=r.attenuationDistance||1/0;const o=r.attenuationColor||[1,1,1];return e.attenuationColor=new V().setRGB(o[0],o[1],o[2],H),Promise.all(s)}}class xn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_IOR}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const n=this.parser.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=n.extensions[this.name];return e.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class bn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_SPECULAR}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[],r=n.extensions[this.name];e.specularIntensity=r.specularFactor!==void 0?r.specularFactor:1,r.specularTexture!==void 0&&s.push(i.assignTexture(e,"specularIntensityMap",r.specularTexture));const o=r.specularColorFactor||[1,1,1];return e.specularColor=new V().setRGB(o[0],o[1],o[2],H),r.specularColorTexture!==void 0&&s.push(i.assignTexture(e,"specularColorMap",r.specularColorTexture,Q)),Promise.all(s)}}class yn{constructor(t){this.parser=t,this.name=R.EXT_MATERIALS_BUMP}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[],r=n.extensions[this.name];return e.bumpScale=r.bumpFactor!==void 0?r.bumpFactor:1,r.bumpTexture!==void 0&&s.push(i.assignTexture(e,"bumpMap",r.bumpTexture)),Promise.all(s)}}class Tn{constructor(t){this.parser=t,this.name=R.KHR_MATERIALS_ANISOTROPY}getMaterialType(t){const i=this.parser.json.materials[t];return!i.extensions||!i.extensions[this.name]?null:O}extendMaterialParams(t,e){const i=this.parser,n=i.json.materials[t];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();const s=[],r=n.extensions[this.name];return r.anisotropyStrength!==void 0&&(e.anisotropy=r.anisotropyStrength),r.anisotropyRotation!==void 0&&(e.anisotropyRotation=r.anisotropyRotation),r.anisotropyTexture!==void 0&&s.push(i.assignTexture(e,"anisotropyMap",r.anisotropyTexture)),Promise.all(s)}}class wn{constructor(t){this.parser=t,this.name=R.KHR_TEXTURE_BASISU}loadTexture(t){const e=this.parser,i=e.json,n=i.textures[t];if(!n.extensions||!n.extensions[this.name])return null;const s=n.extensions[this.name],r=e.options.ktx2Loader;if(!r){if(i.extensionsRequired&&i.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return e.loadTextureImage(t,s.source,r)}}class Rn{constructor(t){this.parser=t,this.name=R.EXT_TEXTURE_WEBP}loadTexture(t){const e=this.name,i=this.parser,n=i.json,s=n.textures[t];if(!s.extensions||!s.extensions[e])return null;const r=s.extensions[e],o=n.images[r.source];let a=i.textureLoader;if(o.uri){const c=i.options.manager.getHandler(o.uri);c!==null&&(a=c)}return i.loadTextureImage(t,r.source,a)}}class En{constructor(t){this.parser=t,this.name=R.EXT_TEXTURE_AVIF}loadTexture(t){const e=this.name,i=this.parser,n=i.json,s=n.textures[t];if(!s.extensions||!s.extensions[e])return null;const r=s.extensions[e],o=n.images[r.source];let a=i.textureLoader;if(o.uri){const c=i.options.manager.getHandler(o.uri);c!==null&&(a=c)}return i.loadTextureImage(t,r.source,a)}}class _n{constructor(t){this.name=R.EXT_MESHOPT_COMPRESSION,this.parser=t}loadBufferView(t){const e=this.parser.json,i=e.bufferViews[t];if(i.extensions&&i.extensions[this.name]){const n=i.extensions[this.name],s=this.parser.getDependency("buffer",n.buffer),r=this.parser.options.meshoptDecoder;if(!r||!r.supported){if(e.extensionsRequired&&e.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){const a=n.byteOffset||0,c=n.byteLength||0,d=n.count,l=n.byteStride,f=new Uint8Array(o,a,c);return r.decodeGltfBufferAsync?r.decodeGltfBufferAsync(d,l,f,n.mode,n.filter).then(function(h){return h.buffer}):r.ready.then(function(){const h=new ArrayBuffer(d*l);return r.decodeGltfBuffer(new Uint8Array(h),d,l,f,n.mode,n.filter),h})})}else return null}}class An{constructor(t){this.name=R.EXT_MESH_GPU_INSTANCING,this.parser=t}createNodeMesh(t){const e=this.parser.json,i=e.nodes[t];if(!i.extensions||!i.extensions[this.name]||i.mesh===void 0)return null;const n=e.meshes[i.mesh];for(const c of n.primitives)if(c.mode!==C.TRIANGLES&&c.mode!==C.TRIANGLE_STRIP&&c.mode!==C.TRIANGLE_FAN&&c.mode!==void 0)return null;const r=i.extensions[this.name].attributes,o=[],a={};for(const c in r)o.push(this.parser.getDependency("accessor",r[c]).then(d=>(a[c]=d,a[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(t)),Promise.all(o).then(c=>{const d=c.pop(),l=d.isGroup?d.children:[d],f=c[0].count,h=[];for(const x of l){const w=new re,g=new z,y=new Xe,T=new z(1,1,1),N=new Et(x.geometry,x.material,f);for(let _=0;_<f;_++)a.TRANSLATION&&g.fromBufferAttribute(a.TRANSLATION,_),a.ROTATION&&y.fromBufferAttribute(a.ROTATION,_),a.SCALE&&T.fromBufferAttribute(a.SCALE,_),N.setMatrixAt(_,w.compose(g,y,T));for(const _ in a)if(_==="_COLOR_0"){const L=a[_];N.instanceColor=new _t(L.array,L.itemSize,L.normalized)}else _!=="TRANSLATION"&&_!=="ROTATION"&&_!=="SCALE"&&x.geometry.setAttribute(_,a[_]);$e.prototype.copy.call(N,x),this.parser.assignFinalMaterial(N),h.push(N)}return d.isGroup?(d.clear(),d.add(...h),d):h[0]}))}}const tt="glTF",Y=12,He={JSON:1313821514,BIN:5130562};class Nn{constructor(t){this.name=R.KHR_BINARY_GLTF,this.content=null,this.body=null;const e=new DataView(t,0,Y),i=new TextDecoder;if(this.header={magic:i.decode(new Uint8Array(t.slice(0,4))),version:e.getUint32(4,!0),length:e.getUint32(8,!0)},this.header.magic!==tt)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const n=this.header.length-Y,s=new DataView(t,Y);let r=0;for(;r<n;){const o=s.getUint32(r,!0);r+=4;const a=s.getUint32(r,!0);if(r+=4,a===He.JSON){const c=new Uint8Array(t,Y+r,o);this.content=i.decode(c)}else if(a===He.BIN){const c=Y+r;this.body=t.slice(c,c+o)}r+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Sn{constructor(t,e){if(!e)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=R.KHR_DRACO_MESH_COMPRESSION,this.json=t,this.dracoLoader=e,this.dracoLoader.preload()}decodePrimitive(t,e){const i=this.json,n=this.dracoLoader,s=t.extensions[this.name].bufferView,r=t.extensions[this.name].attributes,o={},a={},c={};for(const d in r){const l=Re[d]||d.toLowerCase();o[l]=r[d]}for(const d in t.attributes){const l=Re[d]||d.toLowerCase();if(r[d]!==void 0){const f=i.accessors[t.attributes[d]],h=$[f.componentType];c[l]=h.name,a[l]=f.normalized===!0}}return e.getDependency("bufferView",s).then(function(d){return new Promise(function(l,f){n.decodeDracoFile(d,function(h){for(const x in h.attributes){const w=h.attributes[x],g=a[x];g!==void 0&&(w.normalized=g)}l(h)},o,c,H,f)})})}}class Ln{constructor(){this.name=R.KHR_TEXTURE_TRANSFORM}extendTexture(t,e){return(e.texCoord===void 0||e.texCoord===t.channel)&&e.offset===void 0&&e.rotation===void 0&&e.scale===void 0||(t=t.clone(),e.texCoord!==void 0&&(t.channel=e.texCoord),e.offset!==void 0&&t.offset.fromArray(e.offset),e.rotation!==void 0&&(t.rotation=e.rotation),e.scale!==void 0&&t.repeat.fromArray(e.scale),t.needsUpdate=!0),t}}class Mn{constructor(){this.name=R.KHR_MESH_QUANTIZATION}}class nt extends Jt{constructor(t,e,i,n){super(t,e,i,n)}copySampleValue_(t){const e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=t*n*3+n;for(let r=0;r!==n;r++)e[r]=i[s+r];return e}interpolate_(t,e,i,n){const s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=o*2,c=o*3,d=n-e,l=(i-e)/d,f=l*l,h=f*l,x=t*c,w=x-c,g=-2*h+3*f,y=h-f,T=1-g,N=y-f+l;for(let _=0;_!==o;_++){const L=r[w+_+o],I=r[w+_+a]*d,M=r[x+_+o],D=r[x+_]*d;s[_]=T*L+N*I+g*M+y*D}return s}}const kn=new Xe;class In extends nt{interpolate_(t,e,i,n){const s=super.interpolate_(t,e,i,n);return kn.fromArray(s).normalize().toArray(s),s}}const C={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},$={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Ge={9728:qe,9729:Te,9984:kt,9985:Mt,9986:Lt,9987:Ye},Ue={33071:Ct,33648:It,10497:we},he={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Re={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},K={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Cn={CUBICSPLINE:void 0,LINEAR:Ze,STEP:Yt},me={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function vn(u){return u.DefaultMaterial===void 0&&(u.DefaultMaterial=new We({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Wt})),u.DefaultMaterial}function B(u,t,e){for(const i in e.extensions)u[i]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[i]=e.extensions[i])}function j(u,t){t.extras!==void 0&&(typeof t.extras=="object"?Object.assign(u.userData,t.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras))}function jn(u,t,e){let i=!1,n=!1,s=!1;for(let c=0,d=t.length;c<d;c++){const l=t[c];if(l.POSITION!==void 0&&(i=!0),l.NORMAL!==void 0&&(n=!0),l.COLOR_0!==void 0&&(s=!0),i&&n&&s)break}if(!i&&!n&&!s)return Promise.resolve(u);const r=[],o=[],a=[];for(let c=0,d=t.length;c<d;c++){const l=t[c];if(i){const f=l.POSITION!==void 0?e.getDependency("accessor",l.POSITION):u.attributes.position;r.push(f)}if(n){const f=l.NORMAL!==void 0?e.getDependency("accessor",l.NORMAL):u.attributes.normal;o.push(f)}if(s){const f=l.COLOR_0!==void 0?e.getDependency("accessor",l.COLOR_0):u.attributes.color;a.push(f)}}return Promise.all([Promise.all(r),Promise.all(o),Promise.all(a)]).then(function(c){const d=c[0],l=c[1],f=c[2];return i&&(u.morphAttributes.position=d),n&&(u.morphAttributes.normal=l),s&&(u.morphAttributes.color=f),u.morphTargetsRelative=!0,u})}function On(u,t){if(u.updateMorphTargets(),t.weights!==void 0)for(let e=0,i=t.weights.length;e<i;e++)u.morphTargetInfluences[e]=t.weights[e];if(t.extras&&Array.isArray(t.extras.targetNames)){const e=t.extras.targetNames;if(u.morphTargetInfluences.length===e.length){u.morphTargetDictionary={};for(let i=0,n=e.length;i<n;i++)u.morphTargetDictionary[e[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Dn(u){let t;const e=u.extensions&&u.extensions[R.KHR_DRACO_MESH_COMPRESSION];if(e?t="draco:"+e.bufferView+":"+e.indices+":"+ge(e.attributes):t=u.indices+":"+ge(u.attributes)+":"+u.mode,u.targets!==void 0)for(let i=0,n=u.targets.length;i<n;i++)t+=":"+ge(u.targets[i]);return t}function ge(u){let t="";const e=Object.keys(u).sort();for(let i=0,n=e.length;i<n;i++)t+=e[i]+":"+u[e[i]]+";";return t}function Ee(u){switch(u){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Pn(u){return u.search(/\.jpe?g($|\?)/i)>0||u.search(/^data\:image\/jpeg/)===0?"image/jpeg":u.search(/\.webp($|\?)/i)>0||u.search(/^data\:image\/webp/)===0?"image/webp":u.search(/\.ktx2($|\?)/i)>0||u.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const Fn=new re;class Hn{constructor(t={},e={}){this.json=t,this.extensions={},this.plugins={},this.options=e,this.cache=new on,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let i=!1,n=-1,s=!1,r=-1;if(typeof navigator<"u"){const o=navigator.userAgent;i=/^((?!chrome|android).)*safari/i.test(o)===!0;const a=o.match(/Version\/(\d+)/);n=i&&a?parseInt(a[1],10):-1,s=o.indexOf("Firefox")>-1,r=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||i&&n<17||s&&r<98?this.textureLoader=new At(this.options.manager):this.textureLoader=new Nt(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new ze(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(t){this.extensions=t}setPlugins(t){this.plugins=t}parse(t,e){const i=this,n=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(r){return r._markDefs&&r._markDefs()}),Promise.all(this._invokeAll(function(r){return r.beforeRoot&&r.beforeRoot()})).then(function(){return Promise.all([i.getDependencies("scene"),i.getDependencies("animation"),i.getDependencies("camera")])}).then(function(r){const o={scene:r[0][n.scene||0],scenes:r[0],animations:r[1],cameras:r[2],asset:n.asset,parser:i,userData:{}};return B(s,o,n),j(o,n),Promise.all(i._invokeAll(function(a){return a.afterRoot&&a.afterRoot(o)})).then(function(){for(const a of o.scenes)a.updateMatrixWorld();t(o)})}).catch(e)}_markDefs(){const t=this.json.nodes||[],e=this.json.skins||[],i=this.json.meshes||[];for(let n=0,s=e.length;n<s;n++){const r=e[n].joints;for(let o=0,a=r.length;o<a;o++)t[r[o]].isBone=!0}for(let n=0,s=t.length;n<s;n++){const r=t[n];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(i[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(t,e){e!==void 0&&(t.refs[e]===void 0&&(t.refs[e]=t.uses[e]=0),t.refs[e]++)}_getNodeRef(t,e,i){if(t.refs[e]<=1)return i;const n=i.clone(),s=(r,o)=>{const a=this.associations.get(r);a!=null&&this.associations.set(o,a);for(const[c,d]of r.children.entries())s(d,o.children[c])};return s(i,n),n.name+="_instance_"+t.uses[e]++,n}_invokeOne(t){const e=Object.values(this.plugins);e.push(this);for(let i=0;i<e.length;i++){const n=t(e[i]);if(n)return n}return null}_invokeAll(t){const e=Object.values(this.plugins);e.unshift(this);const i=[];for(let n=0;n<e.length;n++){const s=t(e[n]);s&&i.push(s)}return i}getDependency(t,e){const i=t+":"+e;let n=this.cache.get(i);if(!n){switch(t){case"scene":n=this.loadScene(e);break;case"node":n=this._invokeOne(function(s){return s.loadNode&&s.loadNode(e)});break;case"mesh":n=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(e)});break;case"accessor":n=this.loadAccessor(e);break;case"bufferView":n=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(e)});break;case"buffer":n=this.loadBuffer(e);break;case"material":n=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(e)});break;case"texture":n=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(e)});break;case"skin":n=this.loadSkin(e);break;case"animation":n=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(e)});break;case"camera":n=this.loadCamera(e);break;default:if(n=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(t,e)}),!n)throw new Error("Unknown type: "+t);break}this.cache.add(i,n)}return n}getDependencies(t){let e=this.cache.get(t);if(!e){const i=this,n=this.json[t+(t==="mesh"?"es":"s")]||[];e=Promise.all(n.map(function(s,r){return i.getDependency(t,r)})),this.cache.add(t,e)}return e}loadBuffer(t){const e=this.json.buffers[t],i=this.fileLoader;if(e.type&&e.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+e.type+" buffer type is not supported.");if(e.uri===void 0&&t===0)return Promise.resolve(this.extensions[R.KHR_BINARY_GLTF].body);const n=this.options;return new Promise(function(s,r){i.load(J.resolveURL(e.uri,n.path),s,void 0,function(){r(new Error('THREE.GLTFLoader: Failed to load buffer "'+e.uri+'".'))})})}loadBufferView(t){const e=this.json.bufferViews[t];return this.getDependency("buffer",e.buffer).then(function(i){const n=e.byteLength||0,s=e.byteOffset||0;return i.slice(s,s+n)})}loadAccessor(t){const e=this,i=this.json,n=this.json.accessors[t];if(n.bufferView===void 0&&n.sparse===void 0){const r=he[n.type],o=$[n.componentType],a=n.normalized===!0,c=new o(n.count*r);return Promise.resolve(new ue(c,r,a))}const s=[];return n.bufferView!==void 0?s.push(this.getDependency("bufferView",n.bufferView)):s.push(null),n.sparse!==void 0&&(s.push(this.getDependency("bufferView",n.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",n.sparse.values.bufferView))),Promise.all(s).then(function(r){const o=r[0],a=he[n.type],c=$[n.componentType],d=c.BYTES_PER_ELEMENT,l=d*a,f=n.byteOffset||0,h=n.bufferView!==void 0?i.bufferViews[n.bufferView].byteStride:void 0,x=n.normalized===!0;let w,g;if(h&&h!==l){const y=Math.floor(f/h),T="InterleavedBuffer:"+n.bufferView+":"+n.componentType+":"+y+":"+n.count;let N=e.cache.get(T);N||(w=new c(o,y*h,n.count*h/d),N=new St(w,h/d),e.cache.add(T,N)),g=new qt(N,a,f%h/d,x)}else o===null?w=new c(n.count*a):w=new c(o,f,n.count*a),g=new ue(w,a,x);if(n.sparse!==void 0){const y=he.SCALAR,T=$[n.sparse.indices.componentType],N=n.sparse.indices.byteOffset||0,_=n.sparse.values.byteOffset||0,L=new T(r[1],N,n.sparse.count*y),I=new c(r[2],_,n.sparse.count*a);o!==null&&(g=new ue(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let M=0,D=L.length;M<D;M++){const P=L[M];if(g.setX(P,I[M*a]),a>=2&&g.setY(P,I[M*a+1]),a>=3&&g.setZ(P,I[M*a+2]),a>=4&&g.setW(P,I[M*a+3]),a>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=x}return g})}loadTexture(t){const e=this.json,i=this.options,s=e.textures[t].source,r=e.images[s];let o=this.textureLoader;if(r.uri){const a=i.manager.getHandler(r.uri);a!==null&&(o=a)}return this.loadTextureImage(t,s,o)}loadTextureImage(t,e,i){const n=this,s=this.json,r=s.textures[t],o=s.images[e],a=(o.uri||o.bufferView)+":"+r.sampler;if(this.textureCache[a])return this.textureCache[a];const c=this.loadImageSource(e,i).then(function(d){d.flipY=!1,d.name=r.name||o.name||"",d.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(d.name=o.uri);const f=(s.samplers||{})[r.sampler]||{};return d.magFilter=Ge[f.magFilter]||Te,d.minFilter=Ge[f.minFilter]||Ye,d.wrapS=Ue[f.wrapS]||we,d.wrapT=Ue[f.wrapT]||we,d.generateMipmaps=!d.isCompressedTexture&&d.minFilter!==qe&&d.minFilter!==Te,n.associations.set(d,{textures:t}),d}).catch(function(){return null});return this.textureCache[a]=c,c}loadImageSource(t,e){const i=this,n=this.json,s=this.options;if(this.sourceCache[t]!==void 0)return this.sourceCache[t].then(l=>l.clone());const r=n.images[t],o=self.URL||self.webkitURL;let a=r.uri||"",c=!1;if(r.bufferView!==void 0)a=i.getDependency("bufferView",r.bufferView).then(function(l){c=!0;const f=new Blob([l],{type:r.mimeType});return a=o.createObjectURL(f),a});else if(r.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+t+" is missing URI and bufferView");const d=Promise.resolve(a).then(function(l){return new Promise(function(f,h){let x=f;e.isImageBitmapLoader===!0&&(x=function(w){const g=new ve(w);g.needsUpdate=!0,f(g)}),e.load(J.resolveURL(l,s.path),x,void 0,h)})}).then(function(l){return c===!0&&o.revokeObjectURL(a),j(l,r),l.userData.mimeType=r.mimeType||Pn(r.uri),l}).catch(function(l){throw console.error("THREE.GLTFLoader: Couldn't load texture",a),l});return this.sourceCache[t]=d,d}assignTexture(t,e,i,n){const s=this;return this.getDependency("texture",i.index).then(function(r){if(!r)return null;if(i.texCoord!==void 0&&i.texCoord>0&&(r=r.clone(),r.channel=i.texCoord),s.extensions[R.KHR_TEXTURE_TRANSFORM]){const o=i.extensions!==void 0?i.extensions[R.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const a=s.associations.get(r);r=s.extensions[R.KHR_TEXTURE_TRANSFORM].extendTexture(r,o),s.associations.set(r,a)}}return n!==void 0&&(r.colorSpace=n),t[e]=r,r})}assignFinalMaterial(t){const e=t.geometry;let i=t.material;const n=e.attributes.tangent===void 0,s=e.attributes.color!==void 0,r=e.attributes.normal===void 0;if(t.isPoints){const o="PointsMaterial:"+i.uuid;let a=this.cache.get(o);a||(a=new vt,fe.prototype.copy.call(a,i),a.color.copy(i.color),a.map=i.map,a.sizeAttenuation=!1,this.cache.add(o,a)),i=a}else if(t.isLine){const o="LineBasicMaterial:"+i.uuid;let a=this.cache.get(o);a||(a=new jt,fe.prototype.copy.call(a,i),a.color.copy(i.color),a.map=i.map,this.cache.add(o,a)),i=a}if(n||s||r){let o="ClonedMaterial:"+i.uuid+":";n&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),r&&(o+="flat-shading:");let a=this.cache.get(o);a||(a=i.clone(),s&&(a.vertexColors=!0),r&&(a.flatShading=!0),n&&(a.normalScale&&(a.normalScale.y*=-1),a.clearcoatNormalScale&&(a.clearcoatNormalScale.y*=-1)),this.cache.add(o,a),this.associations.set(a,this.associations.get(i))),i=a}t.material=i}getMaterialType(){return We}loadMaterial(t){const e=this,i=this.json,n=this.extensions,s=i.materials[t];let r;const o={},a=s.extensions||{},c=[];if(a[R.KHR_MATERIALS_UNLIT]){const l=n[R.KHR_MATERIALS_UNLIT];r=l.getMaterialType(),c.push(l.extendParams(o,s,e))}else{const l=s.pbrMetallicRoughness||{};if(o.color=new V(1,1,1),o.opacity=1,Array.isArray(l.baseColorFactor)){const f=l.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],H),o.opacity=f[3]}l.baseColorTexture!==void 0&&c.push(e.assignTexture(o,"map",l.baseColorTexture,Q)),o.metalness=l.metallicFactor!==void 0?l.metallicFactor:1,o.roughness=l.roughnessFactor!==void 0?l.roughnessFactor:1,l.metallicRoughnessTexture!==void 0&&(c.push(e.assignTexture(o,"metalnessMap",l.metallicRoughnessTexture)),c.push(e.assignTexture(o,"roughnessMap",l.metallicRoughnessTexture))),r=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(t)}),c.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(t,o)})))}s.doubleSided===!0&&(o.side=Ot);const d=s.alphaMode||me.OPAQUE;if(d===me.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,d===me.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&r!==W&&(c.push(e.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new Ve(1,1),s.normalTexture.scale!==void 0)){const l=s.normalTexture.scale;o.normalScale.set(l,l)}if(s.occlusionTexture!==void 0&&r!==W&&(c.push(e.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&r!==W){const l=s.emissiveFactor;o.emissive=new V().setRGB(l[0],l[1],l[2],H)}return s.emissiveTexture!==void 0&&r!==W&&c.push(e.assignTexture(o,"emissiveMap",s.emissiveTexture,Q)),Promise.all(c).then(function(){const l=new r(o);return s.name&&(l.name=s.name),j(l,s),e.associations.set(l,{materials:t}),s.extensions&&B(n,l,s),l})}createUniqueName(t){const e=Dt.sanitizeNodeName(t||"");return e in this.nodeNamesUsed?e+"_"+ ++this.nodeNamesUsed[e]:(this.nodeNamesUsed[e]=0,e)}loadGeometries(t){const e=this,i=this.extensions,n=this.primitiveCache;function s(o){return i[R.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,e).then(function(a){return Ke(a,o,e)})}const r=[];for(let o=0,a=t.length;o<a;o++){const c=t[o],d=Dn(c),l=n[d];if(l)r.push(l.promise);else{let f;c.extensions&&c.extensions[R.KHR_DRACO_MESH_COMPRESSION]?f=s(c):f=Ke(new Pt,c,e),n[d]={primitive:c,promise:f},r.push(f)}}return Promise.all(r)}loadMesh(t){const e=this,i=this.json,n=this.extensions,s=i.meshes[t],r=s.primitives,o=[];for(let a=0,c=r.length;a<c;a++){const d=r[a].material===void 0?vn(this.cache):this.getDependency("material",r[a].material);o.push(d)}return o.push(e.loadGeometries(r)),Promise.all(o).then(function(a){const c=a.slice(0,a.length-1),d=a[a.length-1],l=[];for(let h=0,x=d.length;h<x;h++){const w=d[h],g=r[h];let y;const T=c[h];if(g.mode===C.TRIANGLES||g.mode===C.TRIANGLE_STRIP||g.mode===C.TRIANGLE_FAN||g.mode===void 0)y=s.isSkinnedMesh===!0?new Ft(w,T):new Je(w,T),y.isSkinnedMesh===!0&&y.normalizeSkinWeights(),g.mode===C.TRIANGLE_STRIP?y.geometry=Fe(y.geometry,Be):g.mode===C.TRIANGLE_FAN&&(y.geometry=Fe(y.geometry,ye));else if(g.mode===C.LINES)y=new Ht(w,T);else if(g.mode===C.LINE_STRIP)y=new Gt(w,T);else if(g.mode===C.LINE_LOOP)y=new Ut(w,T);else if(g.mode===C.POINTS)y=new Kt(w,T);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(y.geometry.morphAttributes).length>0&&On(y,s),y.name=e.createUniqueName(s.name||"mesh_"+t),j(y,s),g.extensions&&B(n,y,g),e.assignFinalMaterial(y),l.push(y)}for(let h=0,x=l.length;h<x;h++)e.associations.set(l[h],{meshes:t,primitives:h});if(l.length===1)return s.extensions&&B(n,l[0],s),l[0];const f=new pe;s.extensions&&B(n,f,s),e.associations.set(f,{meshes:t});for(let h=0,x=l.length;h<x;h++)f.add(l[h]);return f})}loadCamera(t){let e;const i=this.json.cameras[t],n=i[i.type];if(!n){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return i.type==="perspective"?e=new Qe(Bt.radToDeg(n.yfov),n.aspectRatio||1,n.znear||1,n.zfar||2e6):i.type==="orthographic"&&(e=new zt(-n.xmag,n.xmag,n.ymag,-n.ymag,n.znear,n.zfar)),i.name&&(e.name=this.createUniqueName(i.name)),j(e,i),Promise.resolve(e)}loadSkin(t){const e=this.json.skins[t],i=[];for(let n=0,s=e.joints.length;n<s;n++)i.push(this._loadNodeShallow(e.joints[n]));return e.inverseBindMatrices!==void 0?i.push(this.getDependency("accessor",e.inverseBindMatrices)):i.push(null),Promise.all(i).then(function(n){const s=n.pop(),r=n,o=[],a=[];for(let c=0,d=r.length;c<d;c++){const l=r[c];if(l){o.push(l);const f=new re;s!==null&&f.fromArray(s.array,c*16),a.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',e.joints[c])}return new Vt(o,a)})}loadAnimation(t){const e=this.json,i=this,n=e.animations[t],s=n.name?n.name:"animation_"+t,r=[],o=[],a=[],c=[],d=[];for(let l=0,f=n.channels.length;l<f;l++){const h=n.channels[l],x=n.samplers[h.sampler],w=h.target,g=w.node,y=n.parameters!==void 0?n.parameters[x.input]:x.input,T=n.parameters!==void 0?n.parameters[x.output]:x.output;w.node!==void 0&&(r.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",y)),a.push(this.getDependency("accessor",T)),c.push(x),d.push(w))}return Promise.all([Promise.all(r),Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(d)]).then(function(l){const f=l[0],h=l[1],x=l[2],w=l[3],g=l[4],y=[];for(let N=0,_=f.length;N<_;N++){const L=f[N],I=h[N],M=x[N],D=w[N],P=g[N];if(L===void 0)continue;L.updateMatrix&&L.updateMatrix();const G=i._createAnimationTracks(L,I,M,D,P);if(G)for(let X=0;X<G.length;X++)y.push(G[X])}const T=new Xt(s,void 0,y);return j(T,n),T})}createNodeMesh(t){const e=this.json,i=this,n=e.nodes[t];return n.mesh===void 0?null:i.getDependency("mesh",n.mesh).then(function(s){const r=i._getNodeRef(i.meshCache,n.mesh,s);return n.weights!==void 0&&r.traverse(function(o){if(o.isMesh)for(let a=0,c=n.weights.length;a<c;a++)o.morphTargetInfluences[a]=n.weights[a]}),r})}loadNode(t){const e=this.json,i=this,n=e.nodes[t],s=i._loadNodeShallow(t),r=[],o=n.children||[];for(let c=0,d=o.length;c<d;c++)r.push(i.getDependency("node",o[c]));const a=n.skin===void 0?Promise.resolve(null):i.getDependency("skin",n.skin);return Promise.all([s,Promise.all(r),a]).then(function(c){const d=c[0],l=c[1],f=c[2];f!==null&&d.traverse(function(h){h.isSkinnedMesh&&h.bind(f,Fn)});for(let h=0,x=l.length;h<x;h++)d.add(l[h]);return d})}_loadNodeShallow(t){const e=this.json,i=this.extensions,n=this;if(this.nodeCache[t]!==void 0)return this.nodeCache[t];const s=e.nodes[t],r=s.name?n.createUniqueName(s.name):"",o=[],a=n._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(t)});return a&&o.push(a),s.camera!==void 0&&o.push(n.getDependency("camera",s.camera).then(function(c){return n._getNodeRef(n.cameraCache,s.camera,c)})),n._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(t)}).forEach(function(c){o.push(c)}),this.nodeCache[t]=Promise.all(o).then(function(c){let d;if(s.isBone===!0?d=new $t:c.length>1?d=new pe:c.length===1?d=c[0]:d=new $e,d!==c[0])for(let l=0,f=c.length;l<f;l++)d.add(c[l]);if(s.name&&(d.userData.name=s.name,d.name=r),j(d,s),s.extensions&&B(i,d,s),s.matrix!==void 0){const l=new re;l.fromArray(s.matrix),d.applyMatrix4(l)}else s.translation!==void 0&&d.position.fromArray(s.translation),s.rotation!==void 0&&d.quaternion.fromArray(s.rotation),s.scale!==void 0&&d.scale.fromArray(s.scale);if(!n.associations.has(d))n.associations.set(d,{});else if(s.mesh!==void 0&&n.meshCache.refs[s.mesh]>1){const l=n.associations.get(d);n.associations.set(d,{...l})}return n.associations.get(d).nodes=t,d}),this.nodeCache[t]}loadScene(t){const e=this.extensions,i=this.json.scenes[t],n=this,s=new pe;i.name&&(s.name=n.createUniqueName(i.name)),j(s,i),i.extensions&&B(e,s,i);const r=i.nodes||[],o=[];for(let a=0,c=r.length;a<c;a++)o.push(n.getDependency("node",r[a]));return Promise.all(o).then(function(a){for(let d=0,l=a.length;d<l;d++)s.add(a[d]);const c=d=>{const l=new Map;for(const[f,h]of n.associations)(f instanceof fe||f instanceof ve)&&l.set(f,h);return d.traverse(f=>{const h=n.associations.get(f);h!=null&&l.set(f,h)}),l};return n.associations=c(s),s})}_createAnimationTracks(t,e,i,n,s){const r=[],o=t.name?t.name:t.uuid,a=[];K[s.path]===K.weights?t.traverse(function(f){f.morphTargetInfluences&&a.push(f.name?f.name:f.uuid)}):a.push(o);let c;switch(K[s.path]){case K.weights:c=Oe;break;case K.rotation:c=De;break;case K.translation:case K.scale:c=je;break;default:i.itemSize===1?c=Oe:c=je;break}const d=n.interpolation!==void 0?Cn[n.interpolation]:Ze,l=this._getArrayFromAccessor(i);for(let f=0,h=a.length;f<h;f++){const x=new c(a[f]+"."+K[s.path],e.array,l,d);n.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(x),r.push(x)}return r}_getArrayFromAccessor(t){let e=t.array;if(t.normalized){const i=Ee(e.constructor),n=new Float32Array(e.length);for(let s=0,r=e.length;s<r;s++)n[s]=e[s]*i;e=n}return e}_createCubicSplineTrackInterpolant(t){t.createInterpolant=function(i){const n=this instanceof De?In:nt;return new n(this.times,this.values,this.getValueSize()/3,i)},t.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Gn(u,t,e){const i=t.attributes,n=new et;if(i.POSITION!==void 0){const o=e.json.accessors[i.POSITION],a=o.min,c=o.max;if(a!==void 0&&c!==void 0){if(n.set(new z(a[0],a[1],a[2]),new z(c[0],c[1],c[2])),o.normalized){const d=Ee($[o.componentType]);n.min.multiplyScalar(d),n.max.multiplyScalar(d)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=t.targets;if(s!==void 0){const o=new z,a=new z;for(let c=0,d=s.length;c<d;c++){const l=s[c];if(l.POSITION!==void 0){const f=e.json.accessors[l.POSITION],h=f.min,x=f.max;if(h!==void 0&&x!==void 0){if(a.setX(Math.max(Math.abs(h[0]),Math.abs(x[0]))),a.setY(Math.max(Math.abs(h[1]),Math.abs(x[1]))),a.setZ(Math.max(Math.abs(h[2]),Math.abs(x[2]))),f.normalized){const w=Ee($[f.componentType]);a.multiplyScalar(w)}o.max(a)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}n.expandByVector(o)}u.boundingBox=n;const r=new Qt;n.getCenter(r.center),r.radius=n.min.distanceTo(n.max)/2,u.boundingSphere=r}function Ke(u,t,e){const i=t.attributes,n=[];function s(r,o){return e.getDependency("accessor",r).then(function(a){u.setAttribute(o,a)})}for(const r in i){const o=Re[r]||r.toLowerCase();o in u.attributes||n.push(s(i[r],o))}if(t.indices!==void 0&&!u.index){const r=e.getDependency("accessor",t.indices).then(function(o){u.setIndex(o)});n.push(r)}return Pe.workingColorSpace!==H&&"COLOR_0"in i&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Pe.workingColorSpace}" not supported.`),j(u,t),Gn(u,t,e),Promise.all(n).then(function(){return t.targets!==void 0?jn(u,t.targets,e):u})}const Un=({tierColor:u,modelUrl:t})=>{const e=A.useRef(null),i=A.useRef(null),n=A.useRef(null);return A.useEffect(()=>{if(!e.current)return;const s=new Zt;i.current=s;const r=new Qe(75,1,.1,1e3),o=new en({antialias:!0,alpha:!0});o.setSize(300,400),o.setPixelRatio(window.devicePixelRatio),e.current.appendChild(o.domElement);const d=new tn(16777215,.5);s.add(d);const l=new ne(u,2,10);l.position.set(2,3,4),s.add(l);const f=new ne("#00f2ff",1,10);f.position.set(-2,1,2),s.add(f);let h;if(t)new an().load(t,y=>{const T=y.scene;n.current=T,s.add(T);const _=new et().setFromObject(T).getCenter(new z);T.position.sub(_)});else{const g=new nn(1.5,0),y=new sn({color:u,emissive:u,emissiveIntensity:.5,shininess:100,transparent:!0,opacity:.8,wireframe:!1});h=new Je(g,y),s.add(h)}r.position.z=5;const x=()=>{requestAnimationFrame(x),n.current?n.current.rotation.y+=.01:h&&(h.rotation.y+=.015,h.rotation.x+=.005),o.render(s,r)};x();const w=e.current;return()=>{w&&w.removeChild(o.domElement),o.dispose()}},[t,u]),A.useEffect(()=>{i.current&&i.current.traverse(s=>{s instanceof ne&&s.position.x===2&&s.color.set(u)})},[u]),p.jsxs("div",{className:"gacha-3d-showcase",children:[p.jsxs("div",{className:"showcase-pedestal",children:[p.jsx("div",{className:"pedestal-top"}),p.jsx("div",{className:"pedestal-glow",style:{"--tier-color":u}})]}),p.jsx("div",{ref:e,className:"three-container"}),p.jsx("style",{children:`
                .gacha-3d-showcase {
                    position: relative;
                    width: 300px;
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .three-container {
                    width: 100%;
                    height: 100%;
                    z-index: 2;
                }

                .showcase-pedestal {
                    position: absolute;
                    bottom: 40px;
                    width: 160px;
                    height: 20px;
                    z-index: 1;
                }

                .pedestal-top {
                    width: 100%;
                    height: 100%;
                    background: #1a1a2e;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                }

                .pedestal-glow {
                    position: absolute;
                    inset: -25px;
                    background: radial-gradient(circle, var(--tier-color) 0%, transparent 70%);
                    opacity: 0.5;
                    filter: blur(15px);
                    animation: pulse 2s infinite alternate;
                }

                .three-container::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 1;
                    opacity: ${u==="#6366f1"?1:0};
                    transition: opacity 0.5s;
                }

                @keyframes pulse {
                    from { transform: scale(0.98) translateY(2px); opacity: 0.4; }
                    to { transform: scale(1.02) translateY(-2px); opacity: 0.5; }
                }
            `})]})},E={common:"#b0c3d9",rare:"#0070dd",epic:"#a335ee",legendary:"#ff8000"},xe={common:q,rare:be,epic:ft,legendary:ut},se=[{id:"bronze",name:"BRONZE",color:"#cd7f32",icon:"/images/ui/Killucoins/coin_cobre.webp",cost:1,customModelData:1e4,rewards:[{id:"b1",name:"100 XP",rarity:"common",color:E.common},{id:"b2",name:"50 KilluCoins",rarity:"common",color:E.common},{id:"b3",name:"Gorro de Lana",rarity:"common",color:E.common},{id:"b4",name:"200 XP",rarity:"rare",color:E.rare},{id:"b5",name:"100 KilluCoins",rarity:"rare",color:E.rare}]},{id:"silver",name:"SILVER",color:"#c0c0c0",icon:"/images/ui/Killucoins/coin_plata.webp",cost:100,customModelData:10004,rewards:[{id:"s1",name:"300 XP",rarity:"common",color:E.common},{id:"s2",name:"Partículas Simples",rarity:"common",color:E.common},{id:"s3",name:"200 KilluCoins",rarity:"rare",color:E.rare},{id:"s4",name:"Key Crate (Cobre)",rarity:"rare",color:E.rare},{id:"s5",name:"Mascota: Slime",rarity:"rare",color:E.rare}]},{id:"gold",name:"GOLD",color:"#ffd700",icon:"/images/ui/Killucoins/coin_oro.webp",cost:1e4,customModelData:10003,rewards:[{id:"g1",name:"1000 XP",rarity:"rare",color:E.rare},{id:"g2",name:"Sombrero Pirata",rarity:"rare",color:E.rare},{id:"g3",name:"x5 Diamantes",rarity:"rare",color:E.rare},{id:"g4",name:"Permiso /colors",rarity:"epic",color:E.epic},{id:"g5",name:"1000 KilluCoins",rarity:"epic",color:E.epic}]},{id:"emerald",name:"EMERALD",color:"#50c878",icon:"/images/ui/Killucoins/coin_esmeralda.webp",cost:1e6,customModelData:10001,rewards:[{id:"e1",name:"Efecto de Rastro",rarity:"rare",color:E.rare},{id:"e2",name:"Key Crate (Oro)",rarity:"epic",color:E.epic},{id:"e3",name:"2000 KilluCoins",rarity:"epic",color:E.epic},{id:"e4",name:"Kit Especial (Gemas)",rarity:"epic",color:E.epic},{id:"e5",name:"Globo de Helio",rarity:"legendary",color:E.legendary}]},{id:"diamond",name:"DIAMOND",color:"#00f2ff",icon:"/images/ui/Killucoins/coin_diamante.webp",cost:1e8,customModelData:10005,rewards:[{id:"c1",name:"Mascota: Dragón",rarity:"epic",color:E.epic},{id:"c2",name:"Permiso /fly (1h)",rarity:"legendary",color:E.legendary},{id:"c3",name:"Admin: Rename Item",rarity:"legendary",color:E.legendary},{id:"c4",name:"Item Mítico (Custom)",rarity:"legendary",color:E.legendary},{id:"c5",name:"Ultra Crate Key",rarity:"legendary",color:E.legendary}]},{id:"iridium",name:"IRIDIUM",color:"#b150b3",icon:"/images/ui/Killucoins/coin_iridium.webp",cost:1e10,customModelData:10002,rewards:[{id:"i1",name:"Sombrero de Rey",rarity:"epic",color:E.epic},{id:"i2",name:"Admin: Spawn Move",rarity:"legendary",color:E.legendary},{id:"i3",name:"Permiso /vjump",rarity:"legendary",color:E.legendary},{id:"i4",name:"Tag Personalizado",rarity:"legendary",color:E.legendary},{id:"i5",name:"Alas de Iridio",rarity:"legendary",color:E.legendary}]},{id:"ultra",name:"Ultra Gem",color:"#6366f1",icon:"/images/ui/Killucoins/ultra_gen.webp",cost:0,customModelData:99999,rewards:[{id:"u1",name:"Admin: Estructura Custom",rarity:"legendary",color:E.legendary},{id:"u2",name:"x5 Ultra Keys",rarity:"legendary",color:E.legendary},{id:"u3",name:"Mascota Exclusiva",rarity:"legendary",color:E.legendary},{id:"u4",name:"Capa Cosmética",rarity:"legendary",color:E.legendary},{id:"u5",name:"Prestige XP Booster",rarity:"legendary",color:E.legendary}]}],ee="/api",te=se[0].rewards,Kn=u=>u>=1e9?(u/1e9).toFixed(0)+"B":u>=1e6?(u/1e6).toFixed(0)+"M":u>=1e3?(u/1e3).toFixed(0)+"k":u.toString();function qn(){var Me,ke;const{user:u,loading:t}=xt(),e=gt(),{t:i}=rn(),s=["admin","neroferno","killu","helper","developer"].includes((ke=(Me=u==null?void 0:u.user_metadata)==null?void 0:Me.role)==null?void 0:ke.toLowerCase());A.useEffect(()=>{!t&&!s&&e("/")},[t,s,e]);const[r,o]=A.useState(!1),[a,c]=A.useState(null),[d,l]=A.useState([]),[f,h]=A.useState(!1),[x,w]=A.useState(null),[g,y]=A.useState(!1),[T,N]=A.useState(se[0]),[_,L]=A.useState(null),[I,M]=A.useState(!0),[D,P]=A.useState(["bronze"]),[G,X]=A.useState(0),[_e,Ae]=A.useState({});A.useEffect(()=>{se.forEach(m=>{m.id!=="ultra"&&G>=m.cost&&!D.includes(m.id)&&(P(b=>[...b,m.id]),Ae(b=>({...b,[m.id]:!0})),Le("rare"))})},[G,D]);const Ne=A.useRef(null),ie=[A.useRef(null),A.useRef(null),A.useRef(null)],ae=A.useRef(null),st=A.useCallback(async()=>{if(u)try{const{data:{session:m}}=await Z.auth.getSession(),S=await(await fetch(`${ee}/minecraft/link/check?userId=${u.id}`,{headers:{Authorization:`Bearer ${m==null?void 0:m.access_token}`}})).json();S.linked&&(M(!0),S.unlocked_tiers&&P(S.unlocked_tiers.split(",")))}catch(m){console.error(m)}},[u]),rt=async()=>{try{const{data:{session:m}}=await Z.auth.getSession(),S=await(await fetch(`${ee}/minecraft/link/init`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m==null?void 0:m.access_token}`},body:JSON.stringify({userId:u==null?void 0:u.id})})).json();S.success&&S.code&&L(S.code)}catch(m){console.error(m)}};A.useEffect(()=>{},[st,s]);const oe=A.useCallback(async()=>{if(u)try{const{data:{session:m}}=await Z.auth.getSession(),b=await fetch(`${ee}/gacha/history/${u.id}`,{headers:{Authorization:`Bearer ${m==null?void 0:m.access_token}`}});if(b.ok){const S=b.headers.get("content-type");if(S&&S.includes("application/json")){const F=await b.json();if(F.success&&F.data){l(F.data);const k=F.data[0];if(k){const Ie=new Date(k.created_at);Date.now()-Ie.getTime()<1440*60*1e3&&h(!0)}}}}}catch(m){console.error(m)}},[u]);A.useEffect(()=>{s&&oe()},[oe,s]),A.useEffect(()=>{!t&&Ne.current&&s&&(v.fromTo(".gacha-header > *",{opacity:0,y:-20},{opacity:1,y:0,stagger:.2,duration:1,ease:"power3.out"}),v.fromTo(".slot-machine-container",{opacity:0,scale:.9,y:30},{opacity:1,scale:1,y:0,duration:1.2,ease:"back.out(1.7)",delay:.5}))},[t,s]);const Se=A.useMemo(()=>[0,1,2].map(()=>{const m=[];for(let b=0;b<60;b++)m.push(T.rewards[Math.floor(Math.random()*T.rewards.length)]);return m}),[T]),it=async()=>{if(!u||r||f||!I)return;const m=_e[T.id];if(!m&&G<T.cost&&T.id!=="ultra"){w("Saldo insuficiente para esta máquina.");return}o(!0),c(null),w(null),m?Ae(b=>({...b,[T.id]:!1})):T.id!=="ultra"&&X(b=>b-T.cost);try{const{data:{session:b}}=await Z.auth.getSession();v.to(".spin-btn",{x:"random(-2, 2)",duration:.1,repeat:5,yoyo:!0});const S=await fetch(`${ee}/gacha/roll`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${b==null?void 0:b.access_token}`},body:JSON.stringify({userId:u.id})}),F=S.headers.get("content-type");let k;if(F&&F.includes("application/json"))k=await S.json();else{const U=await S.text();throw new Error(U||`Error ${S.status}`)}Se.forEach((U,ce)=>{const le=k.success?te.find(lt=>lt.name===k.data.reward_name)||te[0]:te[(ce+Math.floor(Math.random()*5))%te.length];U[45]=le}),ie.forEach(U=>v.set(U.current,{y:0,filter:"blur(0px)"}));const ot=45*160-80,ct=v.timeline({onComplete:()=>{k.success?(c(k.data),Le(k.data.rarity),oe(),setTimeout(()=>{v.set(ae.current,{display:"flex"}),v.fromTo(ae.current,{scale:0,rotationY:180,opacity:0},{scale:1,rotationY:0,opacity:1,duration:1,ease:"back.out(1.7)"})},500)):(w(k.message||"No has ganado esta vez"),o(!1)),k.success&&o(!1)}});ie.forEach((U,ce)=>{ct.to(U.current,{y:-ot,duration:4+ce*1,ease:"power4.inOut",onUpdate:function(){const le=Math.abs(v.getProperty(this.targets()[0],"y"));v.set(this.targets()[0],{filter:`blur(${Math.min(le/100,4)}px)`})},onComplete:()=>{v.set(U.current,{filter:"blur(0px)"})}},0)})}catch(b){const S=b instanceof Error?b.message:String(b);w(S),o(!1)}},Le=m=>{const b={origin:{y:.7},zIndex:1e4};m==="legendary"?de({...b,particleCount:150,spread:100,colors:["#ff8000","#ffffff","#ffd700"]}):m==="epic"?de({...b,particleCount:80,spread:70,colors:["#a335ee","#ffffff"]}):de({...b,particleCount:40,spread:50})};return t?p.jsx("div",{className:"gacha-page",children:p.jsx(bt,{})}):s?p.jsxs("div",{className:"gacha-page",ref:Ne,children:[p.jsxs("div",{className:"gacha-background",children:[p.jsx("div",{className:"gradient-sphere sphere-1"}),p.jsx("div",{className:"gradient-sphere sphere-2"})]}),p.jsxs("div",{className:"gacha-container",children:[p.jsxs("header",{className:"gacha-header",children:[p.jsxs("span",{className:"gacha-badge",children:[p.jsx(q,{size:14})," CRYSTAL SLOT"]}),p.jsxs("div",{className:"balance-display",onClick:()=>X(m=>m+1e5),children:[p.jsx(be,{size:18})," ",G.toLocaleString()," ",p.jsx("span",{children:"KC"})]}),p.jsx("h1",{children:i("gacha.hero_title")}),p.jsx("p",{children:i("gacha.hero_subtitle")})]}),p.jsxs("div",{className:"gacha-main",children:[I?p.jsx("div",{className:"tier-selector",children:se.map(m=>{const b=!D.includes(m.id);return p.jsxs("button",{className:`tier-btn tier-btn-${m.id} ${T.id===m.id?"active":""} ${b?"locked":""}`,onClick:()=>!r&&!b&&N(m),style:{"--tier-color":m.color},children:[p.jsx("img",{src:m.icon,alt:m.name,className:"tier-icon"}),p.jsxs("div",{className:"tier-info",children:[p.jsx("span",{className:"tier-name",children:m.name}),p.jsx("span",{className:"tier-cost",children:_e[m.id]?p.jsx("span",{className:"free-roll-badge",children:"TIRADA GRATIS!"}):m.id==="ultra"?p.jsx("span",{className:"event-only-badge",children:"EVENTO"}):p.jsxs(p.Fragment,{children:[Kn(m.cost),p.jsx("span",{children:"KilluCoins"})]})})]}),b&&p.jsx(dt,{className:"lock-icon"})]},m.id)})}):p.jsxs("div",{className:"link-bridge-panel",children:[p.jsx(Ce,{size:48,color:"#f59e0b"}),p.jsxs("div",{className:"link-content",children:[p.jsx("h3",{children:i("gacha.account_not_linked")}),p.jsx("p",{children:"Para jugar en el Crystal Slot y sincronizar tus recompensas, debes conectar tu cuenta de Minecraft o Discord."})]}),_?p.jsxs("div",{className:"link-code-box",children:[p.jsx("span",{children:"Tu código universal:"}),p.jsx("div",{className:"link-code-display",children:_}),p.jsx("p",{className:"code-hint",children:"Úsalo en Minecraft con `/link` o en Discord."})]}):p.jsx("button",{className:"btn-link-minecraft",onClick:rt,children:"Generar Código de Vinculación"})]}),I&&p.jsxs("div",{className:"gacha-game-layout",children:[p.jsx(Un,{tierColor:T.color}),p.jsxs("div",{className:"slot-machine-wrapper",children:[p.jsxs("div",{className:"slot-machine-case",children:[p.jsx("div",{className:"slot-machine-lights left",children:[...Array(8)].map((m,b)=>p.jsx("div",{className:`led ${r?"animating":""}`},b))}),p.jsxs("div",{className:"slot-machine-container",children:[p.jsx("div",{className:"slot-glass-reflection"}),p.jsx("div",{className:"slot-selector"}),p.jsx("div",{className:"slot-reels-container",children:Se.map((m,b)=>p.jsx("div",{className:"slot-reel",ref:ie[b],children:m.map((S,F)=>p.jsxs("div",{className:`slot-item rarity-${S.rarity}`,children:[p.jsx("div",{className:"item-icon-wrapper",style:{color:S.color},children:(()=>{const k=xe[S.rarity]||q;return p.jsx(k,{})})()}),p.jsx("span",{className:"item-name",children:S.name})]},F))},b))})]}),p.jsx("div",{className:"slot-machine-lights right",children:[...Array(8)].map((m,b)=>p.jsx("div",{className:`led ${r?"animating":""}`},b))})]}),p.jsxs("div",{className:"slot-controls",children:[p.jsx("div",{className:"lever-base",children:p.jsx("button",{className:`spin-btn ${r||f?"disabled":""}`,onClick:it,disabled:r||f,children:r?p.jsx("span",{className:"loading-dots",children:i("gacha.opening")}):f?i("gacha.btn_cooldown"):p.jsxs(p.Fragment,{children:[p.jsx(be,{size:18})," ",i("gacha.btn_roll")]})})}),f&&!r&&p.jsxs("div",{className:"cooldown-notice",children:[p.jsx(pt,{size:16})," ",i("gacha.vuelve_mañana")]})]})]})]}),x&&p.jsxs("div",{className:"gacha-error",children:[p.jsx(Ce,{size:16})," ",x]})]}),a&&p.jsx("div",{className:"reward-overlay",ref:ae,style:{display:"none"},children:p.jsxs("div",{className:`reward-card rarity-${a.rarity} tier-reward-${T.id}`,children:[p.jsx("div",{className:"reward-shine"}),p.jsx("div",{className:"reward-rarity",children:a.rarity.toUpperCase()}),p.jsx("div",{className:"reward-icon",children:(()=>{const m=xe[a.rarity]||q;return p.jsx(m,{})})()}),p.jsx("h3",{children:a.name}),p.jsx("p",{children:i("gacha.reward_delivered")}),p.jsxs("button",{className:"reward-close-btn",onClick:()=>{c(null),o(!1)},children:[i("gacha.claim_btn")," ",p.jsx(ht,{size:18})]})]})}),p.jsxs("div",{className:"reward-list",children:[p.jsx("h3",{children:i("gacha.possible_rewards")}),p.jsx("div",{className:"rewards-grid",children:T.rewards.map(m=>p.jsxs("div",{className:`reward-grid-item rarity-${m.rarity}`,children:[p.jsx("div",{className:"r-icon",children:(()=>{const b=xe[m.rarity]||q;return p.jsx(b,{})})()}),p.jsx("span",{children:m.name})]},m.id))})]}),p.jsxs("div",{className:`history-drawer ${g?"open":""}`,children:[p.jsxs("button",{className:"history-toggle",onClick:()=>y(!g),children:[p.jsx(mt,{size:18})," ",i("gacha.history_btn")]}),p.jsx("div",{className:"history-content",children:d.length>0?d.map(m=>p.jsxs("div",{className:"history-item",children:[p.jsx("div",{className:`rarity-dot rarity-${m.rarity}`}),p.jsxs("div",{className:"h-info",children:[p.jsx("div",{className:"h-name",children:m.reward_name}),p.jsx("div",{className:"h-date",children:new Date(m.created_at).toLocaleDateString()})]})]},m.id)):p.jsx("p",{className:"no-history",children:i("gacha.no_history")})})]})]}),p.jsx("style",{children:`
                .gacha-page {
                    min-height: 100vh;
                    position: relative;
                    padding: 80px 20px;
                    display: flex;
                    justify-content: center;
                    color: #fff;
                    overflow: hidden;
                    font-family: 'Outfit', sans-serif;
                }
                .gacha-background {
                    position: fixed;
                    inset: 0;
                    background: #050508;
                    z-index: -1;
                }
                .gradient-sphere {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                }
                .sphere-1 { top: -100px; right: -100px; background: #8b5cf6; }
                .sphere-2 { bottom: -100px; left: -100px; background: #0ea5e9; }

                .gacha-container {
                    width: 100%;
                    max-width: 1000px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                }

                .gacha-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .gacha-badge {
                    background: rgba(139, 92, 246, 0.1);
                    color: #a78bfa;
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 1.5rem;
                }
                .gacha-header h1 {
                    font-size: 4rem;
                    font-weight: 950;
                    margin: 0;
                    background: linear-gradient(to bottom, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -2px;
                    text-transform: uppercase;
                }
                .gacha-header p {
                    color: #94a3b8;
                    font-size: 1.2rem;
                    margin-top: 1rem;
                    max-width: 600px;
                }

                /* Tier Selector */
                .tier-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 1rem;
                }

                .tier-btn {
                    padding: 0.8rem 1.2rem;
                    background: rgba(15, 15, 25, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 14px;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(12px);
                    text-align: left;
                }
                
                .tier-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .tier-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: var(--tier-color);
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 0;
                }

                .tier-btn.active {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--tier-color);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(var(--tier-color-rgb, 139, 92, 246), 0.2);
                }

                .tier-btn.active::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: var(--tier-color);
                    box-shadow: 2px 0 10px var(--tier-color);
                }

                .tier-btn-ultra {
                    background: linear-gradient(to top, rgba(0, 100, 255, 0.1), rgba(150, 0, 255, 0.1), rgba(0, 0, 0, 0.8)) !important;
                    border: 1px solid rgba(100, 100, 255, 0.3) !important;
                    box-shadow: 0 0 20px rgba(100, 100, 255, 0.1);
                    animation: ultra-glow-new 3s infinite alternate;
                }

                @keyframes ultra-glow-new {
                    from { box-shadow: 0 0 10px rgba(0, 150, 255, 0.1); border-color: rgba(100, 100, 255, 0.3); }
                    to { box-shadow: 0 0 25px rgba(150, 0, 255, 0.3); border-color: rgba(200, 100, 255, 0.5); }
                }

                .tier-btn-ultra.active {
                    background: linear-gradient(to top, rgba(0, 50, 200, 0.4), rgba(100, 0, 200, 0.4), rgba(0, 0, 0, 0.9)) !important;
                    border-color: #8b5cf6 !important;
                    transform: scale(1.05) translateY(-5px);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.4) !important;
                }

                .tier-btn-ultra .tier-icon {
                    filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.8));
                    animation: icon-pulse-new 2s infinite ease-in-out;
                    position: relative;
                    z-index: 2;
                }

                .tier-btn-ultra::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 20%;
                    width: 40px;
                    height: 40px;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%);
                    transform: translate(-50%, -50%);
                    filter: blur(10px);
                    animation: aura-pulse 3s infinite alternate;
                    z-index: 1;
                }

                @keyframes aura-pulse {
                    from { transform: translate(-50%, -50%) scale(0.98); opacity: 0.5; }
                    to { transform: translate(-50%, -50%) scale(1.05); opacity: 0.7; }
                }

                @keyframes icon-pulse-new {
                    0% { transform: scale(1); filter: drop-shadow(0 0 5px #6366f1); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 20px #a855f7); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 5px #6366f1); }
                }

                .free-roll-badge {
                    background: #22c55e;
                    color: #fff;
                    font-size: 0.6rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 900;
                    letter-spacing: 0.5px;
                    animation: pulse-green 1.5s infinite;
                }

                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                .event-only-badge {
                    background: #ffd700;
                    color: #000;
                    font-size: 0.6rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 900;
                    letter-spacing: 1px;
                }

                .tier-btn-iridium.active {
                    background: linear-gradient(135deg, rgba(177, 80, 179, 0.2), rgba(66, 14, 151, 0.4)) !important;
                    border-color: #b150b3 !important;
                    box-shadow: 0 0 20px rgba(177, 80, 179, 0.3), inset 0 0 15px rgba(66, 14, 151, 0.5);
                }

                .tier-reward-iridium {
                    background: linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 100%) !important;
                    border: 2px solid #b150b3 !important;
                    box-shadow: 0 0 50px rgba(177, 80, 179, 0.4), inset 0 0 30px rgba(66, 14, 151, 0.3) !important;
                }

                .tier-reward-iridium .reward-shine {
                    background: radial-gradient(circle, #b150b3 0%, #420e97 70%) !important;
                    opacity: 0.6 !important;
                }

                .balance-display {
                    background: rgba(255, 215, 0, 0.1);
                    border: 1px solid rgba(255, 215, 0, 0.2);
                    padding: 8px 16px;
                    border-radius: 100px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #ffd700;
                    font-weight: 700;
                    font-family: monospace;
                    cursor: pointer;
                    margin-bottom: 1rem;
                    transition: all 0.3s;
                }

                .balance-display:hover {
                    background: rgba(255, 215, 0, 0.2);
                    transform: scale(1.05);
                }

                .balance-display span {
                    font-size: 0.7rem;
                    opacity: 0.7;
                }

                .tier-icon {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                    filter: drop-shadow(0 0 10px rgba(var(--tier-color-rgb, 255, 255, 255), 0.3));
                    transition: transform 0.4s;
                }

                .tier-btn:hover .tier-icon {
                    transform: scale(1.1) rotate(8deg);
                }

                .tier-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .tier-btn-ultra .tier-info {
                    align-items: flex-start;
                    margin-left: 1rem;
                }

                .tier-name {
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    color: #94a3b8;
                    text-transform: uppercase;
                }

                .tier-cost {
                    font-size: 1.1rem;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                }

                .tier-cost span {
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: #64748b;
                }

                .slot-machine-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3rem;
                    flex: 1;
                }

                .gacha-game-layout {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4rem;
                    width: 100%;
                    max-width: 1200px;
                    margin: 2rem auto;
                    flex-wrap: wrap;
                }

                .tier-btn.locked {
                    filter: grayscale(1) opacity(0.5);
                    cursor: not-allowed;
                    border-color: rgba(255, 255, 255, 0.02);
                }

                .lock-icon {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .link-bridge-panel {
                    background: rgba(139, 92, 246, 0.05);
                    border: 2px dashed rgba(139, 92, 246, 0.2);
                    border-radius: 20px;
                    padding: 3rem;
                    text-align: center;
                    width: 100%;
                    max-width: 700px;
                    margin: 0 auto 3rem;
                    backdrop-filter: blur(10px);
                }

                .link-content h3 {
                    font-size: 1.8rem;
                    margin: 1rem 0 0.5rem;
                    color: #fff;
                }

                .link-content p {
                    color: #94a3b8;
                    margin-bottom: 2rem;
                }

                .link-code-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 2rem;
                    background: rgba(0,0,0,0.2);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .link-code-box span {
                    font-size: 0.9rem;
                    color: #a78bfa;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 700;
                }

                .link-code-display {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: 0.5rem;
                    color: #fff;
                    font-family: 'JetBrains Mono', monospace;
                    text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
                }

                .code-hint {
                    font-size: 0.8rem;
                    color: #64748b;
                }
                .slot-machine-case {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
                    padding: 2rem;
                    border-radius: 40px;
                    border: 4px solid #2a2a4a;
                    box-shadow: 
                        0 20px 50px rgba(0,0,0,0.5),
                        inset 0 0 20px rgba(139, 92, 246, 0.2);
                    position: relative;
                }

                .roulette-track {
                    display: flex;
                    gap: 12px;
                    padding: 0 50%;
                }

                .roulette-item {
                    min-width: 150px;
                    height: 180px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: transform 0.3s;
                }

                .roulette-selector {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 50%;
                    width: 2px;
                    background: #8b5cf6;
                    z-index: 10;
                    transform: translateX(-50%);
                    box-shadow: 0 0 20px #8b5cf6;
                }
                .roulette-selector::after {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 10px solid #8b5cf6;
                }

                .spin-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .spin-btn {
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 1.2rem 4rem;
                    font-size: 1.3rem;
                    font-weight: 900;
                    border-radius: 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 10px 30px rgba(255,255,255,0.1);
                    text-transform: uppercase;
                }
                .spin-btn:hover:not(:disabled) {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(255,255,255,0.2);
                }
                .spin-btn.disabled {
                    background: #1e293b;
                    color: #64748b;
                    cursor: not-allowed;
                }

                .cooldown-notice {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #ef4444;
                    font-weight: 700;
                    font-size: 0.9rem;
                    background: rgba(239, 68, 68, 0.1);
                    padding: 8px 16px;
                    border-radius: 8px;
                }

                .item-icon-wrapper { font-size: 3rem; filter: drop-shadow(0 0 10px currentColor); }
                .item-name { font-size: 0.9rem; font-weight: 800; color: #fff; }

                .reward-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .slot-machine-container {
                    width: 500px;
                    height: 480px;
                    background: #050508;
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    border: 2px solid rgba(255,255,255,0.05);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.9);
                }

                .slot-reels-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    height: 100%;
                    gap: 5px;
                    padding: 0 10px;
                }

                .slot-glass-reflection {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%);
                    pointer-events: none;
                }
                .reward-card {
                    background: #0f172a;
                    width: 380px;
                    padding: 3rem;
                    border-radius: 32px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                }
                .reward-rarity {
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 3px;
                    margin-bottom: 2rem;
                }
                .reward-icon {
                    font-size: 5rem;
                    margin-bottom: 2rem;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
                }
                .reward-card h3 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 1rem 0;
                }
                .reward-card p {
                    color: #94a3b8;
                    margin-bottom: 2.5rem;
                }
                .reward-close-btn {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1rem;
                    border-radius: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .reward-close-btn:hover {
                    background: #fff;
                    color: #000;
                }

                .rarity-common .reward-icon, .rarity-common .reward-rarity { color: #b0c3d9; }
                .rarity-rare .reward-icon, .rarity-rare .reward-rarity { color: #0070dd; }
                .rarity-epic .reward-icon, .rarity-epic .reward-rarity { color: #a335ee; }
                .rarity-legendary .reward-icon, .rarity-legendary .reward-rarity { color: #ff8000; }

                .history-drawer {
                    position: fixed;
                    right: -320px;
                    top: 0;
                    bottom: 0;
                    width: 320px;
                    background: #0a0a0f;
                    border-left: 1px solid rgba(255,255,255,0.05);
                    transition: right 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    z-index: 500;
                    padding: 120px 2rem 2rem;
                }
                .history-drawer.open { right: 0; }
                .history-toggle {
                    position: absolute;
                    left: -130px;
                    top: 150px;
                    background: #0a0a0f;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-right: none;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 12px 0 0 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    margin-bottom: 0.8rem;
                }
                .rarity-dot { width: 8px; height: 8px; border-radius: 50%; }
                .h-name { font-size: 0.9rem; font-weight: 600; }
                .h-date { font-size: 0.75rem; color: #555; }

                .reward-list { width: 100%; margin-top: 4rem; }
                .reward-list h3 { text-align: center; color: #64748b; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2rem; }
                .rewards-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                    gap: 1rem;
                    padding: 0 1rem;
                }
                .reward-grid-item {
                    background: rgba(255,255,255,0.02);
                    padding: 1.5rem;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    border: 1px solid rgba(255,255,255,0.03);
                    filter: grayscale(0.5);
                    transition: all 0.3s;
                }
                .reward-grid-item:hover { filter: grayscale(0); background: rgba(255,255,255,0.05); }
                .reward-grid-item .r-icon { font-size: 1.5rem; }
                .reward-grid-item span { font-size: 0.8rem; font-weight: 600; color: #94a3b8; }

                .link-warning {
                    background: rgba(245, 158, 11, 0.05);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                    padding: 3rem;
                    border-radius: 24px;
                    text-align: center;
                    max-width: 500px;
                    color: #f59e0b;
                }
                .link-warning h3 { font-size: 1.5rem; margin: 1rem 0; }
                .link-warning p { color: #d97706; margin-bottom: 2rem; line-height: 1.6; }
                .btn-link-minecraft {
                    display: inline-block;
                    background: #f59e0b;
                    color: #000;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-weight: 800;
                    text-decoration: none;
                    transition: transform 0.2s;
                }
                .btn-link-minecraft:hover { transform: translateY(-3px); }

                @media (max-width: 768px) {
                    .gacha-header h1 { font-size: 2.5rem; }
                    .history-drawer { width: 100%; right: -100%; }
                    .history-toggle { left: auto; right: 20px; top: 20px; border-radius: 12px; }
                }
            `})]}):null}export{qn as default};
//# sourceMappingURL=Gacha-SoMYd0ar.js.map
