/* Pour activer le lien « Donner votre avis », l'adresse du formulaire est entre les guillemets (laisser vide pour masquer le lien). */
window.SITE_CONFIG={feedbackUrl:"https://docs.google.com/forms/d/e/1FAIpQLSfCsPkwPA11Qi8JS338ool6vwgykDAdgqni8D7GieMxpCbyTg/viewform"};
document.addEventListener("click",function(e){document.querySelectorAll("details.dd[open]").forEach(function(d){if(!d.contains(e.target))d.open=false})});

(function(){
var EN=/^en/i.test(document.documentElement.lang||'');
var T=EN?{ok:'Settings copied. Paste them into your message.',ko:'Copy failed: select and copy the text below.',pg:'Page',dt:'Date',ur:'Address',cf:'Settings',br:'Browser',ver:'Site version',yes:'yes',no:'no',head:'Settings for my pattern'}
:{ok:'Réglages copiés. Collez-les dans votre message.',ko:'Copie impossible : sélectionnez et copiez le texte ci-dessous.',pg:'Page',dt:'Date',ur:'Adresse',cf:'Réglages',br:'Navigateur',ver:'Version du site',yes:'oui',no:'non',head:'Réglages de mon patron'};
var VER='2026-11-06';
function txt(n){return (n.textContent||'').replace(/\s+/g,' ').trim();}
function lab(e){
 var l=null;
 if(e.id){l=document.querySelector('label[for="'+e.id+'"]');}
 if(!l){l=e.closest('label');}
 if(l){var c=l.cloneNode(true);c.querySelectorAll('input,select,textarea,small').forEach(function(x){x.remove();});var t=txt(c);if(t)return t;}
 var p=e.previousSibling;while(p){var t2=(p.nodeType===3?p.textContent:p.textContent||'').replace(/\s+/g,' ').trim();if(t2)return t2.slice(-60);p=p.previousSibling;}
 return e.id||e.name||'?';
}
function collect(){
 var out=[],seen={},m=document.querySelector('main');if(!m)return out;
 m.querySelectorAll('input,select,textarea').forEach(function(e){
  if(e.closest('[hidden]'))return;
  var ty=(e.type||'').toLowerCase();
  if(['file','button','submit','reset','hidden','image'].indexOf(ty)>-1)return;
  var v,l;
  if(ty==='radio'){
   var k='r:'+e.name;if(seen[k])return;seen[k]=1;
   var g=m.querySelector('input[type=radio][name="'+e.name+'"]:checked');if(!g)return;
   var gl=txt(g.closest('label')||g.parentNode);
   var q=g.closest('fieldset');var lg=q&&q.querySelector('legend');
   l=lg?txt(lg):e.name;
   if(!lg){var hx=g.closest('div');while(hx&&!(hx.previousElementSibling&&/^H[1-4]$/.test(hx.previousElementSibling.tagName)))hx=hx.parentElement;if(hx)l=txt(hx.previousElementSibling);}
   v=gl;
  }else if(ty==='checkbox'){l=lab(e);v=e.checked?T.yes:T.no;}
  else if(e.tagName==='SELECT'){l=lab(e);v=e.options[e.selectedIndex]?txt(e.options[e.selectedIndex]):'';}
  else{l=lab(e);v=e.value;var u=e.nextElementSibling;if(u&&u.className==='u')v+=' '+txt(u);}
  l=l.replace(/\s*:\s*$/,'');
  out.push(l+' : '+v);
 });
 return out;
}
function build(){
 var h=document.querySelector('h1');
 var d=new Date();
 var s=[T.head,'',T.pg+' : '+(h?txt(h):document.title)+' ('+location.pathname+')',
  T.dt+' : '+d.toISOString().slice(0,16).replace('T',' ')+' UTC',
  T.ver+' : '+VER,
  T.br+' : '+navigator.userAgent,'',T.cf+' :'];
 return s.concat(collect().map(function(x){return '- '+x;})).join('\n');
}
function init(){
 var b=document.getElementById('cpset');if(!b)return;
 var msg=document.getElementById('cpmsg');
 b.addEventListener('click',function(){
  var t=build();
  function fb(){
   var a=document.getElementById('cpta');
   if(!a){a=document.createElement('textarea');a.id='cpta';a.readOnly=true;a.rows=10;a.style.cssText='width:100%;margin-top:8px;font:12px monospace';b.parentNode.appendChild(a);}
   a.value=t;a.focus();a.select();
   try{if(document.execCommand('copy')){msg.textContent=T.ok;return;}}catch(e){}
   msg.textContent=T.ko;
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){msg.textContent=T.ok;},fb);}else fb();
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
