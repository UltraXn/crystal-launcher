import{j as e,O as Y,F as ee,A as te,m as v,P as ae,Q as re,R as se,b as ie,U as Q,H as ne,V as oe,f as le,g as ce,Y as de,Z as J}from"./ui-vendor-bChcnJbH.js";import{r as x,i as me,u as pe}from"./react-vendor-C4HomasF.js";import{s as T,u as U,L as F,i as he}from"./index-0L0CuJC5.js";import{M as xe}from"./MedalIcons-mJz_o-7P.js";import{M as fe}from"./MarkdownRenderer-DCvGJT-b.js";import{C as ue}from"./ConfirmationModal-wVE31R5h.js";import{u as W}from"./utils-vendor-DpehPmnF.js";import{R as ge,I as be,F as ye,a as we,W as je}from"./three-vendor-3xqboD54.js";import{P as ve,T as _e}from"./PlaystyleRadarFinal-BjG5oMsS.js";import{R as ke}from"./RoleBadge-BGC6nEbu.js";const Ne=async t=>{const{data:d,error:i}=await T.from("profile_comments").select(`
            *,
            author:profiles!author_id (
                username,
                avatar_url,
                role,
                social_avatar_url,
                avatar_preference,
                minecraft_nick,
                status_message,
                full_name,
                discord_tag
            )
        `).eq("profile_id",t).order("created_at",{ascending:!1});if(i)throw i;return d||[]},Se=async(t,d)=>{const{data:{session:i}}=await T.auth.getSession();if(!i)throw new Error("Not authenticated");const{data:c,error:r}=await T.from("profile_comments").insert({profile_id:t,author_id:i.user.id,content:d}).select(`
            *,
            author:profiles!author_id (
                username,
                avatar_url,
                role,
                social_avatar_url,
                avatar_preference,
                minecraft_nick,
                status_message,
                full_name,
                discord_tag
            )
        `).single();if(r)throw r;return c},Ce=async t=>{const{error:d}=await T.from("profile_comments").delete().eq("id",t);if(d)throw d},L={admin:"/ranks/admin.png",developer:"/ranks/developer.png",moderator:"/ranks/moderator.png",helper:"/ranks/helper.png",staff:"/ranks/staff.png",donador:"/ranks/rank-donador.png",fundador:"/ranks/rank-fundador.png",killu:"/ranks/rank-killu.png",neroferno:"/ranks/rank-neroferno.png",user:"/ranks/user.png"};function Ae({profileId:t,isAdmin:d,mockComments:i}){const{t:c}=W(),{user:r}=U(),[g,a]=x.useState([]),[o,_]=x.useState(""),[S,N]=x.useState(!0),[j,E]=x.useState(!1),[C,A]=x.useState(null),[z,P]=x.useState(!1);x.useEffect(()=>{if(i){a(i),N(!1);return}t&&(async()=>{try{const p=await Ne(t);a(p)}catch(p){console.error("Error loading wall comments:",p)}finally{N(!1)}})()},[t,i]);const I=async n=>{if(n.preventDefault(),!(!r||!o.trim()||j)){E(!0);try{const p=await Se(t,o);a(l=>[p,...l]),_("")}catch(p){console.error("Error posting comment:",p)}finally{E(!1)}}},D=n=>{A(n)},R=async()=>{if(C){P(!0);try{await Ce(C),a(n=>n.filter(p=>p.id!==C)),A(null)}catch(n){console.error("Error deleting comment:",n)}finally{P(!1)}}};return e.jsxs("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl",children:[e.jsxs("h3",{className:"flex items-center gap-3 text-xl font-black uppercase tracking-widest text-white mb-6 border-b border-white/5 pb-4",children:[e.jsx(Y,{className:"text-(--accent)"})," ",c("profile.wall.title","Muro de Comentarios")]}),r?e.jsxs("form",{onSubmit:I,className:"mb-8 relative",children:[e.jsxs("div",{className:"relative group/input",children:[e.jsx("textarea",{value:o,onChange:n=>_(n.target.value),placeholder:c("profile.wall.placeholder","Escribe algo en este muro..."),maxLength:500,className:"w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-gray-600 focus:outline-none focus:border-(--accent)/30 transition-all min-h-[120px] resize-none scrollbar-thin scrollbar-thumb-white/10"}),e.jsxs("div",{className:"absolute bottom-4 right-4 text-[10px] font-black text-gray-700 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md",children:[o.length,"/500"]})]}),e.jsx("div",{className:"flex justify-end mt-4",children:e.jsx("button",{type:"submit",disabled:!o.trim()||j,className:"flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-(--accent) hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white",children:j?e.jsx(F,{minimal:!0}):e.jsxs(e.Fragment,{children:[e.jsx(ee,{size:16})," ",c("profile.wall.post","Publicar")]})})})]}):e.jsx("div",{className:"p-8 bg-black/20 border border-white/5 rounded-2xl text-center mb-8 border-dashed",children:e.jsx("p",{className:"text-gray-500 font-bold text-sm",children:c("profile.wall.login_required","Inicia sesión para dejar un comentario.")})}),e.jsx("div",{className:"space-y-4",children:S?e.jsx("div",{className:"flex flex-col items-center justify-center py-12",children:e.jsx(F,{text:c("common.loading")})}):g.length===0?e.jsxs("div",{className:"text-center py-12 px-6 bg-black/20 rounded-2xl border border-white/5",children:[e.jsx("div",{className:"text-4xl mb-4 opacity-20",children:"💬"}),e.jsx("p",{className:"text-gray-500 font-bold italic",children:c("profile.wall.empty","Aún no hay mensajes. ¡Sé el primero!")})]}):e.jsx(te,{children:g.map(n=>e.jsxs(v.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,scale:.95},className:"relative bg-black/20 border border-white/5 rounded-2xl p-6 hover:bg-black/30 transition-colors group",children:[(()=>{var B,M,G,V,K,O,Z,q;const p=(r==null?void 0:r.id)===n.author_id,l=p?r==null?void 0:r.user_metadata:n.author,H=(l==null?void 0:l.avatar_preference)||"minecraft",m=(l==null?void 0:l.minecraft_nick)||"",s=(l==null?void 0:l.status_message)||"",w=(l==null?void 0:l.discord_tag)||"",f=H==="minecraft"&&m,h=f?`https://mc-heads.net/avatar/${m}/128`:p?((B=r==null?void 0:r.user_metadata)==null?void 0:B.picture)||((M=r==null?void 0:r.user_metadata)==null?void 0:M.avatar_url)||((G=n.author)==null?void 0:G.avatar_url):((V=n.author)==null?void 0:V.social_avatar_url)||((K=n.author)==null?void 0:K.avatar_url),b=String(f&&m?m:(l==null?void 0:l.full_name)||(l==null?void 0:l.username)||((O=n.author)==null?void 0:O.username)||c("common.anonymous","Anónimo")),k=p?(Z=r==null?void 0:r.user_metadata)==null?void 0:Z.role:(q=n.author)==null?void 0:q.role,u=String(k||"user").toLowerCase(),y=L[u]||(u.includes("donador")?L.donador:L.user);return e.jsxs("div",{className:"flex gap-4",children:[e.jsxs("div",{className:"shrink-0 group/author relative",children:[e.jsx("div",{className:"cursor-pointer",children:h?e.jsx("img",{src:h,alt:b,className:"w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg"}):e.jsx("div",{className:"w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20",children:e.jsx(Y,{className:"w-6 h-6"})})}),e.jsxs("div",{className:"absolute bottom-full left-0 mb-3 opacity-0 group-hover/author:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-64 bg-[#0a0a0a]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl p-4 translate-y-2 group-hover/author:translate-y-0",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-3 border-b border-white/5 pb-3",children:[e.jsx("img",{src:h||`https://ui-avatars.com/api/?name=${b}`,className:"w-10 h-10 rounded-lg shadow-inner",alt:"Avatar"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-white text-sm leading-tight",children:b}),s&&e.jsxs("p",{className:"text-[10px] text-gray-400 italic mt-0.5 line-clamp-2",children:['"',s,'"']}),e.jsx("img",{src:y,alt:u,className:"h-4 mt-1 object-contain object-left"})]})]}),e.jsxs("div",{className:"space-y-2 text-xs text-gray-400",children:[m&&e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-bold uppercase tracking-wider text-[10px] opacity-70",children:"Minecraft"}),e.jsx("span",{className:"text-white font-mono",children:m})]}),w&&e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-bold uppercase tracking-wider text-[10px] opacity-70",children:"Discord"}),e.jsx("span",{className:"text-indigo-300",children:w})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-bold uppercase tracking-wider text-[10px] opacity-70",children:"Rol"}),e.jsx("span",{className:"text-white capitalize",children:u})]})]})]})]}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex justify-between items-start mb-2",children:[e.jsxs("div",{className:"flex items-center gap-3 flex-wrap",children:[e.jsx("span",{className:"font-black text-white text-sm tracking-wide hover:text-(--accent) cursor-pointer transition-colors",children:b}),e.jsx("img",{src:y,alt:u,className:"h-5 object-contain select-none",onError:X=>{X.currentTarget.style.display="none"}})]}),e.jsx("span",{className:"text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-lg",children:new Date(n.created_at).toLocaleDateString()})]}),e.jsx("div",{className:"text-gray-300 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word font-medium",children:n.content})]})]})})(),(d||(r==null?void 0:r.id)===n.author_id||(r==null?void 0:r.id)===t)&&e.jsx("button",{onClick:()=>D(n.id),className:"absolute top-4 right-4 p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100",title:c("common.delete","Eliminar"),children:e.jsx(ae,{size:12})})]},n.id))})}),e.jsx(ue,{isOpen:!!C,onClose:()=>!z&&A(null),onConfirm:R,isLoading:z,title:c("common.confirm_delete_title","Confirmar eliminación"),message:c("common.confirm_delete_msg","¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer."),confirmText:c("common.delete","Eliminar"),cancelText:c("common.cancel","Cancelar")})]})}function ze({username:t,width:d=300,height:i=400,animation:c="idle",capeUrl:r}){const g=`https://mc-heads.net/skin/${t}`,a=()=>{switch(c){case"walk":return je;case"run":return we;case"fly":return ye;default:return be}};return e.jsx("div",{className:"skin-viewer-container",style:{cursor:"grab"},children:e.jsx(ge,{skinUrl:g,capeUrl:r,height:i,width:d,onReady:({viewer:o})=>{o.animation=new(a()),o.controls.enableZoom=!1,o.autoRotate=!0,o.autoRotateSpeed=.5}})})}function Te({profile:t,currentUser:d,onGiveKarma:i,givingKarma:c}){const{t:r}=W(),g=(()=>{const o=(t.avatar_preference||"minecraft")==="minecraft",_=t.minecraft_nick||t.username;return o?_:t.full_name||t.username})();return e.jsxs("div",{className:"profile-header-premium",children:[e.jsx("style",{children:`
                /* Premium Header & Banner */
                .profile-header-premium {
                    width: 100%;
                    height: 350px;
                    position: relative;
                    overflow: visible;
                    background: #0a0a0a;
                    margin-bottom: 4rem;
                }
                .profile-banner {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                    opacity: 0.6;
                }
                .profile-banner-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, #111 25%, #1a1a1a 50%, #111 75%);
                    background-size: 200% 200%;
                    animation: gradient-shift 10s ease infinite;
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0));
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                }

                /* Floating Avatar Info */
                .profile-header-content {
                    position: absolute;
                    bottom: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 2rem;
                    display: flex;
                    align-items: flex-end;
                    gap: 2rem;
                }
                .profile-avatar-wrapper {
                    position: relative;
                    flex-shrink: 0;
                }
                .profile-avatar-premium {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    border: 6px solid #050505;
                    background: #111;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
                    object-fit: cover;
                }
                .profile-info-floating {
                    padding-bottom: 20px;
                }
                .profile-info-floating h1 {
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -1px;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
                }

                 @media (max-width: 900px) {
                    .profile-header-content {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        bottom: -150px;
                    }
                    .profile-header-premium {
                        margin-bottom: 11rem;
                    }
                    .profile-info-floating h1 {
                        font-size: 2.2rem;
                    }
                }
            `}),t.profile_banner_url?e.jsx("img",{src:t.profile_banner_url,alt:"Banner",className:"profile-banner"}):e.jsx("div",{className:"profile-banner-placeholder"}),e.jsxs("div",{className:"profile-header-content",children:[e.jsx("div",{className:"profile-avatar-wrapper",children:e.jsx("img",{src:t.avatar_preference==="social"?t.social_avatar_url||t.avatar_url||`https://ui-avatars.com/api/?name=${g}`:`https://mc-heads.net/avatar/${t.username}/180`,alt:t.username,className:"profile-avatar-premium"})}),e.jsx("div",{className:"profile-info-floating",children:e.jsxs(v.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},children:[e.jsx(ke,{role:t.role,username:t.username}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1.5rem"},children:[e.jsx("h1",{children:g}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",background:"rgba(255,255,255,0.05)",padding:"0.4rem 0.8rem",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.1)",backdropFilter:"blur(10px)"},children:[e.jsx(re,{style:{color:"#ff4444"},size:16}),e.jsx("span",{style:{fontWeight:800},children:t.reputation||0}),d&&d.id!==t.id&&e.jsx("button",{onClick:i,disabled:c,style:{background:"none",border:"none",color:"#ff4444",cursor:"pointer",padding:"0.2rem",display:"flex",opacity:c?.5:1},title:r("profile.give_karma"),children:e.jsx(se,{size:14})})]})]}),(()=>{var o;const a=(d==null?void 0:d.id)===t.id&&((o=d.user_metadata)==null?void 0:o.status_message)||t.status_message;return a?e.jsx(v.div,{initial:{opacity:0,y:5,scale:.95},animate:{opacity:1,y:0,scale:1},transition:{type:"spring",stiffness:300,damping:20},className:"mt-3 inline-flex relative",children:e.jsx("div",{className:"bg-[#111] border border-white/10 px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md",children:e.jsxs("p",{className:"text-sm font-medium text-gray-300 flex items-center gap-2",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"}),'"',a,'"']})})}):null})()]})})]})]})}function Ee({stats:t,loading:d,isPublic:i,isAdmin:c}){const{t:r}=W(),g=o=>{var N,j;if(!o)return 0;const _=parseInt(((N=o.match(/(\d+)h/))==null?void 0:N[1])||"0"),S=parseInt(((j=o.match(/(\d+)m/))==null?void 0:j[1])||"0");return _+S/60},a=o=>o?parseFloat(o.replace(/[^0-9.-]+/g,"")):0;return e.jsxs("div",{className:"bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl transition-all hover:border-white/20 hover:shadow-2xl",children:[e.jsxs("h3",{className:"flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white/40 mb-6",children:[e.jsx(ie,{size:16})," ",r("profile.playstyle_title","Gráfico de Estilo")]}),i||c?e.jsx("div",{className:"flex flex-col items-center",children:d?e.jsx("div",{className:"py-12",children:e.jsx(F,{text:r("profile.loading_stats")})}):t?e.jsx(e.Fragment,{children:e.jsx("div",{className:"w-full relative z-10",children:e.jsx(ve,{stats:{blocksPlaced:Number(t.blocks_placed||0),blocksMined:Number(t.blocks_mined||0),kills:Number(t.kills||0),mobKills:Number(t.mob_kills||0),playtimeHours:g(t.playtime),money:a(t.money),rank:t.rank||"default"}})})}):e.jsx("div",{className:"text-center py-8 text-gray-500 font-bold text-xs italic",children:r("profile.error_stats","No se pudieron cargar los datos de estilo.")})}):e.jsxs("div",{className:"text-center py-12 px-6 bg-black/20 rounded-2xl border border-dashed border-white/5",children:[e.jsx("div",{className:"text-2xl mb-2 opacity-30",children:"🔒"}),e.jsx("p",{className:"text-gray-500 font-bold text-xs",children:r("profile.private_stats","Este usuario mantiene su estilo de juego en privado.")})]})]})}const $="/api";function Me(){const{username:t}=me(),d=pe(),{t:i,i18n:c}=W(),{user:r}=U(),g=he(r),[a,o]=x.useState(null),[_,S]=x.useState(!0),[N,j]=x.useState(null),[E,C]=x.useState([]),[A,z]=x.useState(null),[P,I]=x.useState(!1),[D,R]=x.useState(!1),[n,p]=x.useState({visible:!1,message:"",type:"info"}),l=(m,s="info")=>{p({visible:!0,message:m,type:s})},H=async()=>{var m;if(!(!r||!a)&&r.id!==a.id){R(!0);try{const s=await fetch(`${$}/users/${a.id}/karma`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${(m=(await T.auth.getSession()).data.session)==null?void 0:m.access_token}`}});if(!s.ok){const h=await s.text();throw new Error(h||`Error ${s.status}`)}const w=s.headers.get("content-type");let f;if(w&&w.includes("application/json"))f=await s.json();else throw new Error("Invalid response from server");s.ok?(o(h=>h?{...h,reputation:f.newReputation}:null),l(i("profile.karma_success"),"success")):l(f.error||i("profile.karma_error"),"error")}catch(s){console.error(s),l(i("profile.karma_conn_error"),"error")}finally{R(!1)}}};return x.useEffect(()=>{t&&(async()=>{S(!0),j(null);try{const s=await fetch(`${$}/users/profile/${t}`);if(!s.ok)throw s.status===404?new Error(i("profile.not_found","Usuario no encontrado")):new Error("Error loading profile");const w=s.headers.get("content-type");let f;if(w&&w.includes("application/json"))f=await s.json();else throw new Error("Invalid response format from server");if(!f.success||!f.data)throw new Error("Invalid response format");const h=f.data;if(o(h),h.medals&&h.medals.length>0){const b=await fetch(`${$}/settings`);if(b.ok){const k=b.headers.get("content-type");if(k&&k.includes("application/json")){const u=await b.json();if(u.medal_definitions)try{const y=typeof u.medal_definitions=="string"?JSON.parse(u.medal_definitions):u.medal_definitions;C(Array.isArray(y)?y:[])}catch(y){console.warn("Failed to parse medals",y)}}}}if(h.public_stats){I(!0);try{const b=h.minecraft_uuid||h.minecraft_nick||h.original_username||t,k=await fetch(`${$}/player-stats/${b}`);if(k.ok){const u=k.headers.get("content-type");if(u&&u.includes("application/json")){const y=await k.json();y.success&&y.data?z(y.data):z(y)}}}catch(b){console.warn("Failed to fetch stats",b)}finally{I(!1)}}}catch(s){console.error(s),j(s instanceof Error?s.message:"Unknown error")}finally{S(!1)}})()},[t,i]),_?e.jsx("div",{className:"layout-center",children:e.jsx(F,{})}):N?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2rem",minHeight:"80vh",textAlign:"center",padding:"2rem",width:"100%"},children:[e.jsx(v.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},style:{width:"120px",height:"120px",background:"rgba(255, 68, 68, 0.1)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255, 68, 68, 0.2)",marginBottom:"1rem",boxShadow:"0 0 40px rgba(255, 68, 68, 0.1)"},children:e.jsx(Q,{size:50,style:{color:"#ff4444",opacity:.8}})}),e.jsxs("div",{style:{maxWidth:"450px"},children:[e.jsx("h2",{style:{fontSize:"2.5rem",fontWeight:800,marginBottom:"1rem",background:"linear-gradient(to bottom, #fff, #888)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:i("profile.not_found_title","¿A dónde se fue?")}),e.jsx("p",{style:{color:"var(--muted)",fontSize:"1.1rem",lineHeight:1.6,marginBottom:"2.5rem"},children:i("profile.not_found_desc","No hemos podido encontrar a ningún usuario con ese nombre. Quizás se ha perdido en el mar o nunca existió.")}),e.jsxs("button",{className:"nav-btn primary",onClick:()=>d("/"),style:{padding:"1rem 2.5rem",fontSize:"1rem",borderRadius:"12px",display:"inline-flex",alignItems:"center",gap:"0.8rem"},children:[e.jsx(ne,{size:18})," ",i("common.back_home","Volver al Inicio")]})]})]}):a?e.jsxs("div",{className:"public-profile-container fade-in",children:[e.jsx(Te,{profile:a,currentUser:r,onGiveKarma:H,givingKarma:D}),e.jsxs("div",{className:"profile-content",children:[e.jsx("style",{children:`
                 /* Layout */
                .profile-content {
                    width: 100%;
                    max-width: 1200px;
                    padding: 0 1.5rem;
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                    margin: 0 auto;
                }
                .profile-main {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .profile-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                 @media (max-width: 900px) {
                    .profile-content {
                        grid-template-columns: 1fr;
                    }
                }
                
                /* Glassmorphism Cards (Still needed for SkinViewer wrapper) */
                .premium-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 24px;
                    padding: 2rem;
                    position: relative;
                    transition: all 0.3s ease;
                }
                .premium-card:hover {
                    border-color: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                }
                .premium-card h3 {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: rgba(255,255,255,0.4);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                 .skin-preview-premium {
                    width: 100%;
                    aspect-ratio: 3/4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                `}),e.jsxs("div",{className:"profile-sidebar",children:[e.jsxs("div",{className:"premium-card",children:[e.jsxs("h3",{children:[e.jsx(oe,{size:18})," ",i("profile.skin_title")]}),e.jsx("div",{className:"skin-preview-premium",children:e.jsx(ze,{username:a.username,height:380,width:280})})]}),e.jsx(Ee,{stats:A,loading:P,isPublic:!!a.public_stats,isAdmin:g})]}),e.jsxs("div",{className:"profile-main",children:[e.jsx("div",{className:"premium-card",children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"1rem"},children:[e.jsxs("div",{style:{flex:1,minWidth:"300px"},children:[e.jsxs("h3",{children:[e.jsx(Q,{size:18})," ",i("profile.about_me")]}),e.jsx("div",{style:{color:"#aaa",lineHeight:1.8},children:a.bio?e.jsx(fe,{content:a.bio}):e.jsx("p",{style:{fontStyle:"italic"},children:i("profile.no_bio")})})]}),e.jsxs("div",{style:{width:"200px"},children:[e.jsx("h4",{style:{fontSize:"0.7rem",textTransform:"uppercase",color:"#444",letterSpacing:"1px",marginBottom:"1rem"},children:"Social"}),e.jsxs("div",{style:{display:"flex",gap:"0.8rem"},children:[a.social_discord&&e.jsx(v.div,{whileHover:{scale:1.1},whileTap:{scale:.95},style:{cursor:"pointer"},onClick:()=>{navigator.clipboard.writeText(a.social_discord),l(i("common.copied","Copiado al portapapeles"),"success")},title:a.social_discord,children:e.jsxs("svg",{stroke:"currentColor",fill:"currentColor",strokeWidth:"0",viewBox:"0 0 640 512",height:"20",width:"20",xmlns:"http://www.w3.org/2000/svg",style:{color:"#5865F2"},children:[e.jsx("title",{children:a.social_discord}),e.jsx("path",{d:"M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"})]})}),a.social_twitter&&e.jsx(v.a,{whileHover:{scale:1.1},whileTap:{scale:.95},href:a.social_twitter.startsWith("http")?a.social_twitter:`https://twitter.com/${a.social_twitter}`,target:"_blank",rel:"noopener noreferrer",style:{color:"#1d9bf0"},title:i("profile.visit_twitter","Visitar Twitter"),children:e.jsx(le,{size:20})}),a.social_twitch&&e.jsx(v.a,{whileHover:{scale:1.1},whileTap:{scale:.95},href:a.social_twitch.startsWith("http")?a.social_twitch:`https://twitch.tv/${a.social_twitch}`,target:"_blank",rel:"noopener noreferrer",style:{color:"#9146FF"},title:i("profile.visit_twitch","Visitar Twitch"),children:e.jsx(ce,{size:20})}),a.social_youtube&&e.jsx(v.a,{whileHover:{scale:1.1},whileTap:{scale:.95},href:a.social_youtube.startsWith("http")?a.social_youtube:`https://youtube.com/@${a.social_youtube}`,target:"_blank",rel:"noopener noreferrer",style:{color:"#ff0000"},title:i("profile.visit_youtube","Visitar YouTube"),children:e.jsx(de,{size:20})})]})]})]})}),a.medals&&a.medals.length>0&&e.jsxs("div",{className:"premium-card",children:[e.jsxs("h3",{children:[e.jsx(J,{size:18})," ",i("profile.medals")]}),e.jsx("div",{className:"medal-grid",style:{display:"flex",flexWrap:"wrap",gap:"0.8rem"},children:a.medals.map(m=>{const s=E.find(f=>f.id===m);if(!s)return null;const w=xe[s.icon]||J;return e.jsxs(v.div,{whileHover:{scale:1.1,rotate:5},style:{padding:"0.8rem",background:"rgba(255,255,255,0.03)",borderRadius:"12px",border:`1px solid ${s.color}33`,display:"flex",alignItems:"center",gap:"0.8rem"},title:s.description,children:[s.image_url?e.jsx("img",{src:s.image_url,alt:s.name,style:{width:"1.5rem",height:"1.5rem",objectFit:"contain"}}):e.jsx(w,{style:{color:s.color,fontSize:"1.2rem"}}),e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:600},children:c.language.startsWith("en")&&s.name_en?s.name_en:i(`account.medals.items.${m}.title`,s.name)})]},m)})})]}),e.jsx("div",{className:"premium-card",style:{padding:0,background:"transparent",border:"none",backdropFilter:"none"},children:e.jsx(Ae,{profileId:a.id,isAdmin:g})})]})]}),e.jsx(_e,{message:n.message,type:n.type,isVisible:n.visible,onClose:()=>p(m=>({...m,visible:!1}))})]}):null}export{Me as default};
//# sourceMappingURL=PublicProfile-BAVwR5Cc.js.map
