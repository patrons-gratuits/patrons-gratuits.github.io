/* Pour activer le lien « Donner votre avis », l'adresse du formulaire est entre les guillemets (laisser vide pour masquer le lien). */
window.SITE_CONFIG={feedbackUrl:"https://docs.google.com/forms/d/e/1FAIpQLSfCsPkwPA11Qi8JS338ool6vwgykDAdgqni8D7GieMxpCbyTg/viewform",feedbackEntry:""};
/* feedbackEntry : identifiant du champ « message » du formulaire (ex. entry.123456789). S'il est renseigné, les réglages sont collés automatiquement dans le formulaire ; sinon ils sont copiés et il suffit de faire Ctrl+V. */
document.addEventListener("click",function(e){document.querySelectorAll("details.dd[open]").forEach(function(d){if(!d.contains(e.target))d.open=false})});

(function(){
var EN=/^en/i.test(document.documentElement.lang||'');
var T=EN?{ok:'Settings copied and the form is open: paste them into your message (Ctrl+V).',okp:'The form is open with your settings already in it.',lnk:'Open “Give feedback”',ko:'Copy failed: select and copy the text below.',pg:'Page',dt:'Date',ur:'Address',cf:'Settings',br:'Browser',ver:'Site version',yes:'yes',no:'no',head:'Settings for my pattern',cu:'Copy my settings as text',cum:'Settings copied: you can paste them anywhere (word processor, notes…).',cus:'Feedback: copy settings',nm:'Pattern'}
:{ok:'Réglages copiés et formulaire ouvert : collez-les dans votre message (Ctrl+V).',okp:'Le formulaire est ouvert, vos réglages y sont déjà.',lnk:'Ouvrir « Donner votre avis »',ko:'Copie impossible : sélectionnez et copiez le texte ci-dessous.',pg:'Page',dt:'Date',ur:'Adresse',cf:'Réglages',br:'Navigateur',ver:'Version du site',yes:'oui',no:'non',head:'Réglages de mon patron',cu:'Copier mes réglages en texte',cum:'Réglages copiés : vous pouvez les coller où vous voulez (traitement de texte, notes…).',cus:'Problème : rapporter mes réglages',nm:'Patron'};
var VER='2026-11-15';
function txt(n){return (n.textContent||'').replace(/\s+/g,' ').trim();}
function lab(e){
 var l=null;
 if(e.id){l=document.querySelector('label[for="'+e.id+'"]');}
 if(!l){l=e.closest('label');}
 if(l){var c=l.cloneNode(true);c.querySelectorAll('input,select,textarea,small').forEach(function(x){x.remove();});var t=txt(c);if(t)return t;}
 var p=e.previousSibling;while(p){var t2=(p.nodeType===3?p.textContent:p.textContent||'').replace(/\s+/g,' ').trim();if(t2)return t2.slice(-60);p=p.previousSibling;}
 return e.id||e.name||'?';
}
function collect(user,noM){
 var out=[],seen={},m=document.querySelector('main');if(!m)return out;
 m.querySelectorAll('input,select,textarea').forEach(function(e){
  if(e.closest('[hidden]'))return;
  var ty=(e.type||'').toLowerCase();
  if(e.classList.contains('uin'))return;
  if(noM&&window.WZ_CFG&&window.WZ_CFG.measures&&e.id&&e.id.slice(0,2)==='v_'&&window.WZ_CFG.measures.indexOf(e.id.slice(2))>-1)return;
  if(user&&(e.classList.contains('units-sel')||e.classList.contains('paper-sel')))return;
  if(['file','button','submit','reset','hidden','image'].indexOf(ty)>-1)return;
  var v,l;
  if(ty==='radio'){
   var k='r:'+e.name;if(seen[k])return;seen[k]=1;
   var g=m.querySelector('input[type=radio][name="'+e.name+'"]:checked');if(!g)return;
   var gl=txt(g.closest('label')||g.parentNode);
   var q=g.closest('fieldset');var lg=q&&q.querySelector('legend');
   l=lg?txt(lg):e.name;
   if(!lg){var hx=g.closest('div');while(hx&&!(hx.previousElementSibling&&/^H[1-4]$/.test(hx.previousElementSibling.tagName)))hx=hx.parentElement;if(hx)l=txt(hx.previousElementSibling);}
   if(lg){var an=g.parentNode;while(an&&an!==q){var pv=an.previousElementSibling;if(pv&&/^H[2-4]$/.test(pv.tagName)){l+=' — '+txt(pv);break;}an=an.parentNode;}}
   if(/-souf$/.test(e.name))l+=' — '+(EN?'gusset':'soufflet');
   if(l===e.name||!l){var pc=g.closest('.pieces'),pl=pc&&pc.previousElementSibling;if(pl&&pl.tagName==='LABEL'){var cl=pl.cloneNode(true);cl.querySelectorAll('small,input').forEach(function(x){x.remove();});if(txt(cl))l=txt(cl);}}
   if(l===e.name||!l){var hs=m.querySelectorAll('h2,h3'),hb=null;hs.forEach(function(h){if(h.compareDocumentPosition(g)&4)hb=h;});if(hb)l=txt(hb);}
   v=gl;
  }else if(ty==='checkbox'){l=lab(e);v=e.checked?T.yes:T.no;}
  else if(e.tagName==='SELECT'){l=lab(e);v=e.options[e.selectedIndex]?txt(e.options[e.selectedIndex]):'';}
  else{l=lab(e);v=e.value;var u=e.nextElementSibling;if(u&&u.className==='u')v+=' '+txt(u);if(window.UNITS&&window.UNITS.active(e)){var c=parseFloat(e.value);v=user?window.UNITS.fmtCm(e.value)+' ('+(Math.round(c*10)/10)+' cm)':e.value+' cm ('+window.UNITS.fmtCm(e.value)+')';}}
  l=l.replace(/\s*:\s*$/,'');
  var ln=l+' : '+v;if(out.indexOf(ln)>-1)return;out.push(ln);
 });
 return out;
}
function build(){
 var h=document.querySelector('h1');
 var d=new Date();
 var s=[T.head+' : '+(h?txt(h):document.title),'',T.ur+' : '+location.pathname,
  T.dt+' : '+d.toISOString().slice(0,16).replace('T',' ')+' UTC',
  T.ver+' : '+VER,
  T.br+' : '+navigator.userAgent,'',T.cf+' :'];
 return s.concat(collect().map(function(x){return '- '+x;})).join('\n');
}
function buildUser(noM){
 var h=document.querySelector('h1'),d=new Date();
 var ds=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
 var s=[T.nm+' : '+(h?txt(h):document.title),ds,location.href.split('#')[0],''];
 return s.concat(collect(true,noM).map(function(x){return '- '+x;})).join('\n');
}
window.SITE_COPYSETTINGS={build:function(withM){return buildUser(!withM);},ok:T.cum,ko:T.ko};
function init(){
 var b=document.getElementById('cpset');if(!b)return;
 b.textContent=T.cus;


 var msg=document.getElementById('cpmsg');
 b.addEventListener('click',function(){
  var t=build(),c=window.SITE_CONFIG||{},u=c.feedbackUrl,en=c.feedbackEntry,pre=false,w=null;
  if(u){
   var url=u;
   if(en){var q=url+(url.indexOf('?')>-1?'&':'?')+'usp=pp_url&'+en+'='+encodeURIComponent(t);if(q.length<=1900){url=q;pre=true;}}
   try{w=window.open(url,'_blank');if(w)w.opener=null;}catch(e){}
  }
  function done(){
   if(!u){msg.textContent=T.ok;return;}
   if(w){msg.textContent=pre?T.okp:T.ok;}
   else{msg.innerHTML='';msg.appendChild(document.createTextNode(T.ok+' '));var a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';a.textContent=T.lnk;msg.appendChild(a);}
  }
  function fb(){
   var a=document.getElementById('cpta');
   if(!a){a=document.createElement('textarea');a.id='cpta';a.readOnly=true;a.rows=10;a.style.cssText='width:100%;margin-top:8px;font:12px monospace';b.parentNode.appendChild(a);}
   a.value=t;a.focus();a.select();
   try{if(document.execCommand('copy')){done();return;}}catch(e){}
   msg.textContent=T.ko;
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,fb);}else fb();
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
