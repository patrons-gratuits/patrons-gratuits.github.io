/* Mini-croquis interactif de la saharienne – patrons-gratuits.fr
   Usage : <div class="mc" data-lang="fr" data-href="saharienne.html"></div>  (data-genre="f" pour ouvrir sur la coupe femme)
           <script src="mini-croquis.js" defer></script>
   Le dessin est celui du croquis complet (croquis.js, à charger avant ce fichier). */
(function(){
const NS='http://www.w3.org/2000/svg';
let svg=null;                       // svg en cours de dessin
const ST={rab:'p'};                 // forme des rabats en cours
const val=()=>null;                 // non utilisé ici
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);(parent||svg).appendChild(e);return e}
const mx=x=>400-x;
const P=pts=>pts.map(p=>p.join(',')).join(' ');
const mir=pts=>pts.map(([x,y])=>[mx(x),y]);
const S={stroke:'var(--ink)','stroke-width':1.6,'stroke-linejoin':'round','stroke-linecap':'round'};
const STITCH={stroke:'var(--stitch)','stroke-width':1,'stroke-dasharray':'3 2.5',fill:'none'};
function poly(pts,fill,g){return el('polygon',Object.assign({points:P(pts),fill:fill||'var(--fabric)'},S),g)}
function line(a,b,g,st){return el('line',Object.assign({x1:a[0],y1:a[1],x2:b[0],y2:b[1]},st||S),g)}
function path(d,g,st){return el('path',Object.assign({d,fill:'none'},st||S),g)}
function button(x,y,g,r){el('circle',{cx:x,cy:y,r:r||2.6,fill:'var(--fabric2)',stroke:'var(--ink)','stroke-width':1.1},g)}
function inset(pts,d){ // décalage simple vers le centre pour les surpiqûres
  const cx=pts.reduce((s,p)=>s+p[0],0)/pts.length, cy=pts.reduce((s,p)=>s+p[1],0)/pts.length;
  return pts.map(([x,y])=>{const dx=cx-x,dy=cy-y,l=Math.hypot(dx,dy)||1;return [x+dx/l*d*1.4,y+dy/l*d*1.4]});
}

// ---------- composant ----------
const TXT={
 fr:{genre:'Coupe',homme:'Homme',femme:'Femme',man:'Manches',longues:'Longues',courtes:'Courtes',cart:'Cartouchi\u00e8re',sans:'Sans',avec:'Avec',rab:'Rabats',
     p:'En pointe',d:'Droits',a:'Arrondis',c:'Angles coup\u00e9s',aide:'Essayez : chaque choix modifie la saharienne.',
     cta:'Composer ma saharienne',alt:'Croquis de la saharienne'},
 en:{genre:'Cut',homme:'Men\u2019s',femme:'Women\u2019s',man:'Sleeves',longues:'Long',courtes:'Short',cart:'Pen and glasses holder',sans:'None',avec:'Yes',rab:'Flaps',
     p:'Pointed',d:'Straight',a:'Rounded',c:'Cut corners',aide:'Try it: every choice changes the jacket.',
     cta:'Design my safari jacket',alt:'Sketch of the safari jacket'}};
// valeurs passées \u00e0 la page de la saharienne (choix de style uniquement, aucune mesure)
const QP={genre:{h:'homme',f:'femme'},man:{l:'longues',c:'courtes'},cart:{0:'aucune',1:'gauche'},rab:{p:'pointe',d:'droit',a:'arrondi',c:'coupe'}};
function mount(root){
  const L=TXT[root.dataset.lang==='en'?'en':'fr'], href=root.dataset.href||'saharienne.html';
  const s={genre:root.dataset.genre==='f'?'f':'h',man:'l',cart:0,rab:'p'};
  root.innerHTML='';
  const fig=document.createElement('div');fig.className='mc-fig';
  const sv=document.createElementNS(NS,'svg');sv.setAttribute('viewBox','172 48 590 664');sv.setAttribute('role','img');sv.setAttribute('aria-label',L.alt);
  fig.appendChild(sv);root.appendChild(fig);
  const ctl=document.createElement('div');ctl.className='mc-ctl';root.appendChild(ctl);
  function seg(key,label,opts){
    const w=document.createElement('div');w.className='mc-seg';w.setAttribute('role','group');w.setAttribute('aria-label',label);
    const t=document.createElement('span');t.className='mc-lab';t.textContent=label;w.appendChild(t);
    const row=document.createElement('div');row.className='mc-row';w.appendChild(row);
    opts.forEach(([v,txt])=>{const b=document.createElement('button');b.type='button';b.textContent=txt;b.dataset.v=v;
      b.addEventListener('click',()=>{s[key]=key==='cart'?+v:v;draw();});row.appendChild(b);});
    ctl.appendChild(w);return row;
  }
  const rows={genre:seg('genre',L.genre,[['h',L.homme],['f',L.femme]]),
              man:seg('man',L.man,[['l',L.longues],['c',L.courtes]]),
              cart:seg('cart',L.cart,[['0',L.sans],['1',L.avec]]),
              rab:seg('rab',L.rab,[['p',L.p],['d',L.d],['a',L.a],['c',L.c]])};
  const help=document.createElement('p');help.className='mc-help';help.textContent=L.aide;root.appendChild(help);
  // bouton principal : soit un lien placé ailleurs dans la page (data-cta="id"), soit créé ici
  let cta=root.dataset.cta?document.getElementById(root.dataset.cta):null;
  if(!cta){cta=document.createElement('a');cta.className='mc-cta';cta.textContent=L.cta;root.appendChild(cta);}
  function draw(){
    window.SahCroquis.draw(sv,{ver:'s',genre:s.genre,man:s.man,fen:'0',emp:false,epa:true,pat:true,pmc:true,same:!s.cart,
      ps:'c',psr:true,pss:'i',pd:'c',pdr:true,pds:'i',pg:s.cart?'k':'c',pgr:true,pgs:'i',pb:'l',pbr:true,pbs:'i'},s.rab,'face');
    for(const k in rows) rows[k].querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(String(s[k])===b.dataset.v)));
    cta.href=href+'?coupe='+QP.genre[s.genre]+'&manches='+QP.man[s.man]+'&cartouchiere='+QP.cart[s.cart]+'&rabats='+QP.rab[s.rab];
  }
  draw();
}
function init(){document.querySelectorAll('.mc').forEach(mount);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
