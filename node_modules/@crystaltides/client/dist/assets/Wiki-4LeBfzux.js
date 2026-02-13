import{j as e,n as j,aU as p,az as v,A as N,m,_ as A,bc as L}from"./ui-vendor-bChcnJbH.js";import{i as z,r as o,L as C}from"./react-vendor-C4HomasF.js";import{L as f}from"./index-0L0CuJC5.js";import{u as S}from"./utils-vendor-DpehPmnF.js";import{M as E}from"./index-BOjOzEPk.js";const h="/api",_=async r=>{const i=new URL(`${h}/wiki`,window.location.origin),s=await fetch(i.toString());if(!s.ok)throw new Error("Failed to fetch wiki articles");const n=await s.json();return n.data||n},T=async r=>{const i=await fetch(`${h}/wiki/${r}`);if(!i.ok)throw new Error("Article not found");const s=await i.json();return s.data||s};function U(){const{slug:r}=z(),{t:i}=S(),[s,n]=o.useState([]),[c,l]=o.useState(null),[u,g]=o.useState(!0),[w,x]=o.useState(!1),[d,b]=o.useState("");o.useEffect(()=>{(async()=>{try{const t=await _();n(t)}catch(t){console.error("Error loading wiki articles:",t)}finally{g(!1)}})()},[]),o.useEffect(()=>{(async()=>{if(!r){l(null);return}x(!0);try{const t=await T(r);l(t)}catch(t){console.error("Error loading article detail:",t),l(null)}finally{x(!1)}})()},[r]);const k=s.filter(a=>a.title.toLowerCase().includes(d.toLowerCase())||a.category.toLowerCase().includes(d.toLowerCase())),y=Array.from(new Set(s.map(a=>a.category)));return e.jsxs("div",{className:"wiki-container flex min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto gap-8",children:[e.jsx("style",{children:`
                .wiki-container {
                    color: #fff;
                }
                .wiki-sidebar {
                    width: 320px;
                    flex-shrink: 0;
                    position: sticky;
                    top: 100px;
                    height: calc(100vh - 140px);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .wiki-main {
                    flex: 1;
                    min-width: 0;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 3rem;
                    backdrop-filter: blur(10px);
                }
                .wiki-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.8rem 1.2rem;
                    border-radius: 10px;
                    text-decoration: none;
                    color: #aaa;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                    font-size: 0.9rem;
                }
                .wiki-nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                }
                .wiki-nav-item.active {
                    background: var(--accent-dim, rgba(22, 140, 128, 0.1));
                    border-color: var(--accent, #168C80);
                    color: #fff;
                }
                .search-box {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 0.8rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                .search-box input {
                    background: none;
                    border: none;
                    color: #fff;
                    outline: none;
                    width: 100%;
                    font-size: 0.9rem;
                }
                .article-content {
                    line-height: 1.8;
                    color: #ccc;
                }
                .article-content h1, .article-content h2, .article-content h3 {
                    color: #fff;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .article-content a {
                    color: var(--accent, #168C80);
                    text-decoration: none;
                }
                .article-content a:hover {
                    text-decoration: underline;
                }
                .article-content code {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.9em;
                }
                .article-content blockquote {
                    border-left: 4px solid var(--accent, #168C80);
                    padding-left: 1.5rem;
                    margin-left: 0;
                    font-style: italic;
                    color: #aaa;
                }
                
                @media (max-width: 1024px) {
                    .wiki-container {
                        flex-direction: column;
                    }
                    .wiki-sidebar {
                        width: 100%;
                        position: relative;
                        top: 0;
                        height: auto;
                    }
                }
            `}),e.jsxs("aside",{className:"wiki-sidebar",children:[e.jsxs("div",{className:"search-box",children:[e.jsx(j,{className:"text-white/30",size:16}),e.jsx("input",{type:"text",placeholder:i("wiki.search_placeholder","Buscar en la guía..."),value:d,onChange:a=>b(a.target.value)})]}),e.jsx("div",{className:"overflow-y-auto pr-2 space-y-6",children:u?e.jsx(f,{text:""}):y.map(a=>e.jsxs("div",{children:[e.jsxs("h4",{className:"flex items-center gap-2 text-xs uppercase tracking-widest text-white/30 mb-3 px-2",children:[e.jsx(p,{size:10})," ",a]}),e.jsx("div",{className:"space-y-1",children:k.filter(t=>t.category===a).map(t=>e.jsxs(C,{to:`/wiki/${t.slug}`,className:`wiki-nav-item ${r===t.slug?"active":""}`,children:[e.jsx(v,{size:14,className:r===t.slug?"text-accent":"opacity-0"}),t.title]},t.id))})]},a))})]}),e.jsx("main",{className:"wiki-main",children:e.jsx(N,{mode:"wait",children:w?e.jsx(m.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"flex justify-center items-center h-full",children:e.jsx(f,{text:i("wiki.loading_article","Abriendo tomo...")})},"loader"):c?e.jsxs(m.article,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},children:[e.jsxs("header",{className:"mb-12 border-b border-white/10 pb-8",children:[e.jsxs("div",{className:"flex items-center gap-4 text-xs text-white/40 mb-4",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(A,{size:12})," ",new Date(c.updated_at).toLocaleDateString()]}),e.jsxs("span",{className:"flex items-center gap-1 capitalize",children:[e.jsx(p,{size:12})," ",c.category]})]}),e.jsx("h1",{className:"text-4xl font-black mb-4 bg-linear-to-r from-white to-white/50 bg-clip-text text-transparent",children:c.title})]}),e.jsx("div",{className:"article-content",children:e.jsx(E,{children:c.content})})]},c.id):e.jsxs(m.div,{initial:{opacity:0},animate:{opacity:1},className:"flex flex-col items-center justify-center h-full text-center py-20",children:[e.jsx(L,{size:64,className:"text-white/5 mb-6"}),e.jsx("h2",{className:"text-2xl font-bold mb-2",children:i("wiki.welcome_title","Biblioteca de CrystalTides")}),e.jsx("p",{className:"text-white/40 max-w-md",children:i("wiki.welcome_desc","Selecciona un artículo de la izquierda para comenzar a explorar los secretos de estas tierras.")})]},"empty")})})]})}export{U as default};
//# sourceMappingURL=Wiki-4LeBfzux.js.map
