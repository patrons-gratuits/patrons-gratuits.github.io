const DATA=window.PATTERN_DATA;
const TYPES={
 simple:{label:'Poche simple (sans soufflet)',block:0,title:'Poche plaquée',forms:[
  {id:'rect',label:'Rectangulaire',pieces:[['I.1','Poche']]},
  {id:'cut',label:'Angles coupés',pieces:[['I.2','Poche']]},
  {id:'round',label:'Angles arrondis',pieces:[['I.3','Poche']]}]},
 lat:{label:'Poche avec soufflet latéral',block:1,title:'Poche plaquée à soufflet latéral',extra:['Prof_soufflet_lat'],forms:[
  {id:'rect',label:'Rectangulaire',pieces:[['II.1.a','Face avant'],['II.1.b','Bande de soufflet 1','À coudre sur la face avant.'],['II.1.c','Bande de soufflet 2','À coudre sur la bande de soufflet 1 et sur le vêtement.']]},
  {id:'cut',label:'Angles coupés',pieces:[['II.2.a','Face avant'],['II.2.b','Bande de soufflet 1','À coudre sur la face avant.'],['II.2.c','Bande de soufflet 2','À coudre sur la bande de soufflet 1 et sur le vêtement.']]},
  {id:'round',label:'Angles arrondis',pieces:[['II.3.a','Face avant'],['II.3.b','Bande de soufflet 1','À coudre sur la face avant.'],['II.3.c','Bande de soufflet 2','À coudre sur la bande de soufflet 1 et sur le vêtement.']]}]},
 cen:{label:'Poche avec soufflet central',block:2,title:'Poche plaquée à soufflet central',extra:['Prof_pli_central'],forms:[
  {id:'rect',label:'Rectangulaire',pieces:[['III.1','Face avant','Pas de revers intégré : utiliser le revers ajouté.']]},
  {id:'cut',label:'Angles coupés',pieces:[['III.2','Face avant','Pas de revers intégré : utiliser le revers ajouté.']]},
  {id:'round',label:'Angles arrondis',pieces:[['III.3','Face avant','Pas de revers intégré : utiliser le revers ajouté.']]}],
  common:[['Revers Ajouté','Revers ajouté','À coudre sur le haut de la face avant.']]},
 dbl:{label:'Poche avec soufflet latéral et soufflet central',block:2,title:'Poche plaquée à double soufflet',extra:['Prof_soufflet_lat','Prof_pli_central'],forms:[
  {id:'rect',label:'Rectangulaire',pieces:[['III.1','Face avant (soufflet central)','Pas de revers intégré : utiliser le revers ajouté.'],['II.1.b','Bande de soufflet latéral 1','À coudre sur la face avant.',1],['II.1.c','Bande de soufflet latéral 2','À coudre sur la bande de soufflet latéral 1 et sur le vêtement.',1]]},
  {id:'cut',label:'Angles coupés',pieces:[['III.2','Face avant (soufflet central)','Pas de revers intégré : utiliser le revers ajouté.'],['II.2.b','Bande de soufflet latéral 1','À coudre sur la face avant.',1],['II.2.c','Bande de soufflet latéral 2','À coudre sur la bande de soufflet latéral 1 et sur le vêtement.',1]]},
  {id:'round',label:'Angles arrondis',pieces:[['III.3','Face avant (soufflet central)','Pas de revers intégré : utiliser le revers ajouté.'],['II.3.b','Bande de soufflet latéral 1','À coudre sur la face avant.',1],['II.3.c','Bande de soufflet latéral 2','À coudre sur la bande de soufflet latéral 1 et sur le vêtement.',1]]}],
  common:[['Revers Ajouté','Revers ajouté','À coudre sur le haut de la face avant.']]},
 sou1:{label:'Poche avec soufflet latéral – variante en une pièce',block:5,title:'Poche à soufflets latéraux (une pièce)',extra:['Prof_soufflet_lat'],defs:{Prof_soufflet_lat:4},forms:[
  {id:'rect',label:'Rectangulaire',pieces:[['Poche à soufflets latéraux (une pièce)','Poche (devant et soufflets)']]}]},
 sou2:{label:'Poche avec soufflet latéral et soufflet central – variante à soufflets rapportés',block:5,title:'Poche à double soufflet (soufflets rapportés)',extra:['Prof_soufflet_lat','Prof_pli_central'],defs:{Prof_soufflet_lat:4,Prof_pli_central:3.5},forms:[
  {id:'rect',label:'Rectangulaire',pieces:[['Devant de poche','Devant (soufflet central)','Pas de revers intégré : utiliser le revers ajouté.'],['Soufflet côté','Soufflet de côté','Couper 2 exemplaires (pièces identiques).'],['Soufflet bas','Soufflet de fond']]}],
  common:[['Revers Ajouté','Revers ajouté','À coudre sur le haut de la face avant.',2]]}};
const FIELDS=[
 ['H_poche','Hauteur de la poche','cm',1,null],['L_poche','Largeur de la poche','cm',1,null],
 ['A_biseau_entree','Inclinaison de l’entrée (0 = droite)','°',1,null],
 ['H_revers','Hauteur du revers','cm',0.1,null],['Val_repli_poche','Rempli (côtés et fond)','cm',0.1,'de 0 à 2 cm','simple lat cen dbl sou2'],
 ['GenRHP','Rempli haut de poche (proportion du revers)','',0.05,'de 0 à 2','simple lat cen dbl sou2'],
 ['Prof_soufflet_lat','Profondeur du soufflet latéral','cm',0.1,null,'lat dbl sou1 sou2'],
 ['Prof_pli_central','Profondeur du pli central','cm',0.1,null,'cen dbl sou2'],
 ['Prop_angle_coupe','Taille des angles coupés','',0.01,null],
 ['Prop_angle_arrondi','Rayon de l’arrondi','',0.01,null],
 ['Prop_H_rabat','Hauteur du rabat','',0.01,null,'rab'],['Add_L_rabat','Supplément de largeur du rabat','cm',0.1,null,'rab'],
 ['Prop_rabat_angle_coupe','Taille des angles coupés du rabat','',0.01,null,'rab'],['Prop_rabat_angle_arrondi','Rayon de l’arrondi du rabat','',0.01,null,'rab']];
const RAB={rect:['Rabat rectangulaire','Rectangulaire'],cut:['Rabat chanfrein','Angles coupés'],round:['Rabat arrondi','Angles arrondis']};
const fm=v=>String(Math.round(v*10)/10).replace('.',',');
const UNIT_SELECT=false;let U='cm';const K=2.54;
const r2=x=>String(Math.round(x*100)/100);
const toCm=x=>{if(U==='cm')return x;const c=x*K,s=Math.round(c*10)/10;return Math.abs(c-s)<0.03?s:c};/* snap : écarts < 0,3 mm dus à l'arrondi des pouces */
const fromCm=x=>U==='cm'?x:parseFloat(r2(x/K));
const stepOf=s=>U==='in'?(s>=1?0.5:0.05):s;
function cmx(s){if(U==='cm'||s==null)return s;const f=n=>r2(parseFloat(n)/K);
 return String(s).replace(/(\d+(?:\.\d+)?)(\s*(?:and|to|×|x)\s*)(\d+(?:\.\d+)?)(\s*)cm\b/g,(m,a,sep,b)=>f(a)+sep+f(b)+' in').replace(/(\d+(?:\.\d+)?)(\s*)cm\b/g,(m,a)=>f(a)+' in')}
const def={};DATA.variables.forEach(v=>def[v.name]=parseFloat(v.formula));
def.Prof_soufflet_lat=2;const dv=n=>{const T=TYPES[cur];return T&&T.defs&&T.defs[n]!==undefined?T.defs[n]:def[n]};/* valeur par défaut valable pour les trois formes */
const $=id=>document.getElementById(id);
let cur='simple';const keep={};
function hintOf(n,ty){const s=ty!=='simple';
 switch(n){
 case 'H_poche':return s?'de 8 à 50 cm':'de 5 à 50 cm';
 case 'L_poche':return s?'de 8 à 40 cm':'de 5 à 40 cm';
 case 'A_biseau_entree':return s?'0 uniquement pour les poches à soufflet (entrée droite)':'plus la hauteur est importante, plus l’angle peut être important';
 case 'H_revers':return ty==='sou1'?'de 1,5 cm à la moitié de la hauteur (10 cm maximum)':s?'au moins 1,5 cm, plus grande que le rempli d’au moins 0,3 cm, et au plus la moitié de la hauteur (10 cm maximum)':'de 1,5 cm à la moitié de la hauteur de la poche';
 case 'Val_repli_poche':return 'de 0 à 2 cm';
 case 'Prop_H_rabat':return '(en proportion de la hauteur de poche, de 0,1 à 0,4)';
 case 'Add_L_rabat':return 'de 0 à 3 cm (largeur du rabat = largeur de poche + ce supplément)';
 case 'Prop_rabat_angle_coupe':return '(en proportion de la hauteur du rabat, de 0,05 à 0,6, avec un maximum de la moitié de la largeur du rabat)';
 case 'Prop_rabat_angle_arrondi':return '(en proportion de la hauteur du rabat, de 0,05 à 0,6, avec un maximum de la moitié de la largeur du rabat)';
 case 'Prof_soufflet_lat':return (ty==='sou1'||ty==='sou2')?'de 0,5 cm à la moitié de la largeur':'de 0,5 cm à un quart de la largeur, et au plus 80 % du rayon (angles arrondis)';
 case 'Prof_pli_central':return 'de 0,5 cm à un tiers de la largeur';
 case 'Prop_angle_coupe':return '(en proportion de la hauteur de poche, de 0,02 à 0,45 avec un maximum de la moitié de la largeur)';
 case 'Prop_angle_arrondi':return ty==='lat'?'(en proportion de la hauteur de poche, de 0,02 à 0,45, et rayon ≤ 45 % de la largeur)':(ty==='cen'||ty==='dbl')?'(en proportion de la hauteur de poche, de 0,02 à 0,45, et rayon ≤ 30 % de la largeur)':'(en proportion de la hauteur de poche, de 0,02 à 0,45, et rayon ≤ moitié de la largeur)';
 }return null}
function fieldHtml(n,l,u,s){const h0=hintOf(n,cur),h=h0&&cmx(h0),cm=u==='cm';return `<div class="fld" id="w_${n}"><label for="v_${n}">${l}${h?(h[0]==='('?`<small class="hint"> ${h}</small>`:`<small class="hint"> — ${h}</small>`):''}</label><div class="row"><input type="number" id="v_${n}" value="${keep[n]!==undefined?keep[n]:(cm?r2(fromCm(dv(n))):dv(n))}" step="${cm?stepOf(s):s}" min="0"><span class="u${cm?' ucm':''}">${cm?U:u}</span></div>${cm?`<div class="frac" id="f_${n}"></div>`:''}<div class="err" id="e_${n}"></div></div>`}
function renderVars(skip){if(!skip)FIELDS.forEach(([n])=>{const e=$('v_'+n);if(e)keep[n]=e.value});
 const ok=f=>f[5]!=='rab'&&(!f[5]||f[5].split(' ').includes(cur));
 $('vars').innerHTML=FIELDS.filter(ok).map(([n,l,u,s])=>fieldHtml(n,l,u,s)).join('');
 $('rvars').innerHTML=FIELDS.filter(f=>f[5]==='rab').map(([n,l,u,s])=>fieldHtml(n,l,u,s)).join('');
 document.querySelectorAll('#vars input,#rvars input').forEach(i=>i.addEventListener('input',draw))}
function renderRabats(){$('rabats').innerHTML='<label><input type="radio" name="rb" class="rb" value="none" checked> Sans rabat</label>'+Object.keys(RAB).map(k=>`<label><input type="radio" name="rb" class="rb" value="${k}"> ${RAB[k][1]}</label>`).join('');
 document.querySelectorAll('.rb').forEach(i=>i.addEventListener('change',draw))}
function rabId(){const r=document.querySelector('.rb:checked');return r&&r.value!=='none'?r.value:null}
function renderForms(){const T=TYPES[cur];const was=[...document.querySelectorAll('.pc:checked')].map(c=>c.value);
 const pick=T.forms.some(f=>f.id===was[0]&&!f.off)?was[0]:'rect';$('pieces').innerHTML=T.forms.map(f=>`<label><input type="radio" name="pc" class="pc" value="${f.id}" ${f.off?'disabled':''} ${f.id===pick?'checked':''}> ${f.label}</label>`).join('');
 document.querySelectorAll('.pc').forEach(i=>i.addEventListener('change',draw))}
function hasSeam(){const {list}=chosen();return list.some(x=>{const p=DATA.blocks[x.blk].pieces.find(q=>q.name===x.n);return p&&p.seamAllowance})}
function show(e,on){if(e)e.style.display=on?'':'none'}
function syncFields(){const on=hasSeam();$('v_seam').disabled=!on;[document.querySelector('label[for=v_seam]'),$('r_seam'),$('f_seam'),$('e_seam')].forEach(e=>show(e,on));
 $('seamnote').textContent=on?'':'Pour cette poche, le rempli (replis) tient lieu de marge de couture : aucune marge n\u2019est ajoutée.';if(!on){$('e_seam').textContent='';$('v_seam').classList.remove('bad')}
const rbv=rabId();[['Prop_H_rabat',!!rbv],['Add_L_rabat',!!rbv],['Prop_rabat_angle_coupe',rbv==='cut'],['Prop_rabat_angle_arrondi',rbv==='round']].forEach(([n,on])=>{const i=$('v_'+n);if(!i)return;i.disabled=!on;show($('w_'+n),on);if(!on){const e=$('e_'+n);if(e)e.textContent='';i.classList.remove('bad')}});
const f=document.querySelector('.pc:checked'),id=f?f.value:'rect';
 [['Prop_angle_coupe','cut'],['Prop_angle_arrondi','round']].forEach(([n,want])=>{const i=$('v_'+n);if(!i)return;const off=id!==want;i.disabled=off;show($('w_'+n),!off);if(off){const e=$('e_'+n);if(e)e.textContent='';i.classList.remove('bad')}})}
function setType(t){const prev=cur;FIELDS.forEach(([n])=>{const e=$('v_'+n);if(e)keep[n]=e.value});cur=t;
 FIELDS.forEach(([n])=>{const a=(TYPES[prev].defs||{})[n],b=(TYPES[t].defs||{})[n];if((a!==undefined||b!==undefined)&&keep[n]!==undefined&&Math.abs(parseFloat(keep[n])-fromCm(a!==undefined?a:def[n]))<1e-6)keep[n]=r2(fromCm(b!==undefined?b:def[n]))});
 renderVars(true);renderForms();$('typenote').textContent=t==='simple'?'':'Pour l\u2019instant : entr\u00e9e droite uniquement.';draw()}
$('type').innerHTML=Object.keys(TYPES).map(k=>`<option value="${k}">${TYPES[k].label}</option>`).join('');
$('type').addEventListener('change',()=>setType($('type').value));
function inputs(){const o={};FIELDS.forEach(([n,,u])=>{const e=$('v_'+n);const v=e?parseFloat(e.value):NaN;o[n]=isNaN(v)?def[n]:(u==='cm'?toCm(v):v)});
 const s=parseFloat($('v_seam').value);return{ov:o,seam:isNaN(s)?1:toCm(s)}}
function segX(a,b,c,d){const o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return o(a,b,c)*o(a,b,d)<-1e-9&&o(c,d,a)*o(c,d,b)<-1e-9}
function selfX(P){const n=P.length;for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){if(i===0&&j===n-1)continue;if(segX(P[i],P[(i+1)%n],P[j],P[(j+1)%n]))return true}return false}
function cutOK(ov,seam){try{const bl=cur==='dbl'?[[1,['II.2.b','II.2.c']],[2,['III.2']]]:[[1,['II.2.a','II.2.b','II.2.c']]];return bl.every(([b,only])=>PatternEngine.computePieces(PatternEngine.computeBlock(DATA,b,ov),{seamWidth:seam,only}).every(p=>!selfX(p.poly)&&p.poly.every(q=>isFinite(q.x+q.y))&&(!p.sa||(!selfX(p.sa)&&p.sa.every(q=>isFinite(q.x+q.y))))))}catch(e){return false}}
function span(a){if(!a.length)return null;return[a[0],a[a.length-1]]}
function cutFeasible(ov,seam,m){const L=ov.L_poche,H=ov.H_poche;
 if(cutOK(ov,seam))return;
 const ps=[];for(let p=0.5;p<=L/4+1e-9;p+=0.1){const q=Math.round(p*10)/10;if(cutOK(Object.assign({},ov,{Prof_soufflet_lat:q}),seam))ps.push(q)}
 if(ps.length){const [a,b]=span(ps);m.Prof_soufflet_lat='Avec ces angles coupés, la profondeur de soufflet doit être comprise entre '+fm(a)+' et '+fm(b)+' cm (ou réduisez les angles coupés).';return}
 const cs=[];for(let c=0.02;c<=0.4501;c+=0.01){const q=Math.round(c*100)/100;if(q*H<=L/2&&cutOK(Object.assign({},ov,{Prop_angle_coupe:q}),seam))cs.push(q)}
 m.Prop_angle_coupe=cs.length?'Avec cette profondeur de soufflet, la taille des angles coupés doit être comprise entre '+fm(cs[0])+' et '+fm(cs[cs.length-1])+'.':'Cette combinaison de dimensions n\u2019est pas réalisable : modifiez la profondeur du soufflet, le rempli ou les dimensions.'}
function check(ov,seam,forms){const m={},H=ov.H_poche,L=ov.L_poche,ty=cur,s=ty!=='simple',ids=forms.map(f=>f.id);
 const hmin=s?8:5,lmin=s?8:5;
 if(!(H>=hmin&&H<=50))m.H_poche='Entre '+hmin+' et 50 cm.';
 if(!(L>=lmin&&L<=40))m.L_poche='Entre '+lmin+' et 40 cm.';
 if(s){if(!(ov.A_biseau_entree===0))m.A_biseau_entree='Entrée droite uniquement pour les poches à soufflet (mettre 0).'}
 else if(!(ov.A_biseau_entree>=0&&ov.A_biseau_entree<=40))m.A_biseau_entree='Entre 0 et 40°.';
 else if(H>=5&&L>=5&&L*Math.tan(ov.A_biseau_entree*Math.PI/180)>0.5*H+1e-9)m.A_biseau_entree='Trop forte pour une poche de '+fm(H)+' × '+fm(L)+' cm : '+fm(Math.min(40,Math.floor(Math.atan(0.5*H/L)*180/Math.PI*10)/10))+'° au maximum.';
 if(!(ov.Val_repli_poche>=0&&ov.Val_repli_poche<=2))m.Val_repli_poche='Entre 0 et 2 cm.';
 if(!(ov.GenRHP>=0&&ov.GenRHP<=2))m.GenRHP='Entre 0 et 2.';
 if(s){const lo=ty==='sou1'?1.5:Math.max(1.5,(ov.Val_repli_poche||0)+0.3),hi=Math.min(H/2,10);
  if(!(ov.H_revers>=lo-1e-9&&ov.H_revers<=hi+1e-9))m.H_revers=lo<=hi?'Entre '+fm(Math.ceil(lo*10)/10)+' cm (rempli + 0,3 cm) et '+fm(hi)+' cm.':'Impossible avec ce rempli et cette hauteur : diminuez le rempli.'}
 else if(!(ov.H_revers>=1.5&&ov.H_revers<=H/2))m.H_revers='Entre 1,5 cm et la moitié de la hauteur de poche'+(H>=5?' (soit '+fm(H/2)+' cm au maximum).':'.');
 const rmax=ty==='lat'?0.45*L:(ty==='cen'||ty==='dbl')?0.3*L:L/2;
 if(ids.includes('cut')&&!(ov.Prop_angle_coupe>=0.02&&ov.Prop_angle_coupe<=0.45&&ov.Prop_angle_coupe*H<=L/2))m.Prop_angle_coupe='Entre 0,02 et 0,45 (par ex. 0,25), et taille des angles coupés ≤ moitié de la largeur.';
 if(ids.includes('round')&&!(ov.Prop_angle_arrondi>=0.02&&ov.Prop_angle_arrondi<=0.45&&ov.Prop_angle_arrondi*H<=rmax+1e-9))m.Prop_angle_arrondi='Entre 0,02 et 0,45 (par ex. 0,2), et rayon ≤ '+fm(rmax)+' cm ('+(ty==='lat'?'45 %':ty!=='simple'?'30 %':'50 %')+' de la largeur).';
 if(ty==='lat'||ty==='dbl'){const pm=L/4;let lim=pm;if(ids.includes('round'))lim=Math.min(lim,0.8*ov.Prop_angle_arrondi*H);
  if(!(ov.Prof_soufflet_lat>=0.5&&ov.Prof_soufflet_lat<=lim+1e-9))m.Prof_soufflet_lat=lim>=0.5?'Entre 0,5 et '+fm(Math.floor(lim*10)/10)+' cm pour cette poche.':'Impossible avec ce rayon : augmentez le rayon ou la hauteur.'}
 if((ty==='sou1'||ty==='sou2')&&!(ov.Prof_soufflet_lat>=0.5&&ov.Prof_soufflet_lat<=L/2+1e-9))m.Prof_soufflet_lat='Entre 0,5 et '+fm(Math.floor(L/2*10)/10)+' cm pour cette poche.';
 if((ty==='cen'||ty==='dbl'||ty==='sou2')&&!(ov.Prof_pli_central>=0.5&&ov.Prof_pli_central<=L/3+1e-9))m.Prof_pli_central='Entre 0,5 et '+fm(Math.floor(L/3*10)/10)+' cm pour cette largeur.';
 {const rb=rabId();if(rb){const fh=H*ov.Prop_H_rabat,fw=L+ov.Add_L_rabat;
  if(!(ov.Prop_H_rabat>=0.1&&ov.Prop_H_rabat<=0.4))m.Prop_H_rabat='Entre 0,1 et 0,4.';
  if(!(ov.Add_L_rabat>=0&&ov.Add_L_rabat<=3))m.Add_L_rabat='Entre 0 et 3 cm.';
  const pk=rb==='cut'?'Prop_rabat_angle_coupe':rb==='round'?'Prop_rabat_angle_arrondi':null;
  if(pk&&!(ov[pk]>=0.05&&ov[pk]<=0.6&&ov[pk]*fh<=fw/2+1e-9))m[pk]='Entre 0,05 et 0,6, et au plus la moitié de la largeur du rabat ('+fm(fw/2)+' cm ici).'}}
 if(hasSeam()&&!(seam>=0&&seam<=5))m.seam='Entre 0 et 5 cm.';
 if((ty==='lat'||ty==='dbl')&&ids.includes('cut')&&!Object.keys(m).length)cutFeasible(ov,seam,m);
 return m}
function showErrors(m){document.querySelectorAll('.err').forEach(e=>{e.textContent='';});document.querySelectorAll('.row input').forEach(i=>i.classList.remove('bad'));
 Object.keys(m).forEach(k=>{const e=$('e_'+k),i=$('v_'+k);if(e)e.textContent=cmx(m[k]);if(i)i.classList.add('bad')});return Object.keys(m).length>0}
function chosen(){const T=TYPES[cur];const forms=[...document.querySelectorAll('.pc:checked')].map(c=>T.forms.find(f=>f.id===c.value)).filter(Boolean);
 const list=[];forms.forEach(f=>f.pieces.forEach(([n,part,ann,blk])=>list.push({n,form:f.label.replace(/ \(.*\)$/,''),part,ann,blk:blk===undefined?T.block:blk})));
 if(forms.length)(T.common||[]).forEach(([n,part,ann,blk])=>{if(!list.some(x=>x.n===n))list.push({n,form:'',part,ann,blk:blk===undefined?T.block:blk})});
 const rb=rabId();if(rb)list.push({n:RAB[rb][0],form:'Rabat',part:RAB[rb][1],ann:'Couper sur le pli du tissu. Ne pas coudre entre les crans (ouverture pour retourner).',blk:4});
 return{forms,list}}
function compute(){const {ov,seam}=inputs();const T=TYPES[cur];const {forms,list}=chosen();
 const bad=check(ov,seam,forms);if(showErrors(bad)){const e=new Error('');e.fieldErrors=true;throw e}
 const sel=list.map(x=>x.n);
 const build=sw=>{let pcs=[];[...new Set(list.map(x=>x.blk))].forEach(b=>{const res=PatternEngine.computeBlock(DATA,b,ov);const only=list.filter(x=>x.blk===b).map(x=>x.n);
  pcs=pcs.concat(PatternEngine.computePieces(res,{seamWidth:sw,only}).filter(p=>only.includes(p.name)))});
  pcs.sort((a,b)=>sel.indexOf(a.name)-sel.indexOf(b.name));return pcs};
 const isBad=pcs=>pcs.some(p=>selfX(p.poly)||(p.sa&&selfX(p.sa)));
 const pcs=build(seam);
 pcs.forEach(p=>{if(p.name.startsWith('Poche à soufflets latéraux (une pièce)')&&p.internal){const bb=PatternEngine.bbox(p.poly);p.internal=p.internal.filter(l=>!(l.length===2&&Math.abs(l[0].x-l[1].x)<1e-6&&Math.abs(l[0].x-(bb.x0+bb.w/2))<0.05))}});
 if(isBad(pcs)){let mx=-1;for(let k=Math.ceil(seam*10)-1;k>=0;k--){if(!isBad(build(k/10))){mx=k/10;break}}
  if(mx>=0)showErrors({seam:'Marge de couture trop grande pour cette poche : '+fm(mx)+' cm au maximum.'});else $('msg').textContent='';
  const e=new Error(mx>=0?'':'Cette combinaison de valeurs ne donne pas un patron réalisable : modifiez les dimensions.');e.fieldErrors=mx>=0;throw e}
 return{pcs,seam,ov,list,T}}
function fracStr(x){if(!(x>=0))return '';const q=Math.round(x*16),w=Math.floor(q/16);let n=q%16,d=16;while(n&&n%2===0){n/=2;d/=2}
 const f=n?n+'/'+d:'';const s=w&&f?w+' '+f:(f||String(w));return (Math.abs(x*16-q)<0.02?'= ':'≈ ')+s+' in'}
function updateFracs(){document.querySelectorAll('.frac').forEach(e=>{if(U!=='in'){e.textContent='';return}const i=$('v_'+e.id.slice(2));const v=i?parseFloat(i.value):NaN;e.textContent=isNaN(v)?'':fracStr(v)})}
function draw(){syncFields();updateFracs();let r;try{r=compute()}catch(e){$('msg').textContent=e.fieldErrors?'Corrigez les valeurs signalées en rouge.':cmx(e.message);$('dl').disabled=true;return}
 $('dl').disabled=false;
 $('msg').textContent='';const svg=$('prev');let off=0,y1=-1e9,out='';
 r.pcs.forEach(p=>{const it=r.list.find(x=>x.n===p.name);const pts=(p.sa||p.poly).concat(...(p.internal||[]));const b=PatternEngine.bbox(pts);const dx=off-b.x0,dy=-b.y0;
  const P=a=>a.map(q=>(q.x+dx).toFixed(3)+','+(q.y+dy).toFixed(3)).join(' ');
  out+=`<polygon points="${P(p.poly)}" fill="none" stroke="currentColor" stroke-width="2.5" vector-effect="non-scaling-stroke"/>`;
  if(p.sa)out+=`<polygon points="${P(p.sa)}" fill="none" stroke="var(--cut)" stroke-width="4" vector-effect="non-scaling-stroke"/>`;
  (p.notches||[]).forEach(nt=>{const x2=nt.x-nt.nx*nt.len,y2=nt.y-nt.ny*nt.len;out+=`<line x1="${(nt.x+dx).toFixed(3)}" y1="${(nt.y+dy).toFixed(3)}" x2="${(x2+dx).toFixed(3)}" y2="${(y2+dy).toFixed(3)}" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/>`});
  (p.internal||[]).forEach(l=>out+=`<polyline points="${P(l)}" fill="none" stroke="var(--fold)" stroke-width="2" stroke-dasharray="7 5" vector-effect="non-scaling-stroke"/>`);
  out+=`<text x="${off}" y="-.4" font-size=".8" fill="currentColor">${it?((it.form?it.form+' – ':'')+it.part):p.name}</text>`;
  off+=Math.max(b.w,(it?((it.form?it.form+' – ':'')+it.part):p.name).length*0.46)+2;y1=Math.max(y1,b.h)});
 $('lg_s').style.display=r.pcs.some(p=>p.sa)?'':'none';$('lg_f').style.display=r.pcs.some(p=>(p.internal||[]).length)?'':'none';svg.setAttribute('viewBox',`-1 -2 ${Math.max(off,5)} ${Math.max(y1,5)+3}`);svg.innerHTML=out}
function download(){let r;try{r=compute()}catch(e){$('msg').textContent=e.fieldErrors?'Corrigez les valeurs signalées en rouge.':cmx(e.message);return}if(!r.pcs.length){$('msg').textContent='Choisissez au moins une forme.';return}
 const fu=v=>(U==='cm'?fm(v):r2(v/K))+' '+U;const exl={Prof_soufflet_lat:'soufflet latéral',Prof_pli_central:'pli central'};const ex=(r.T.extra||[]).map(k=>', '+exl[k]+' '+fu(r.ov[k])).join('');
 const info=['H '+fu(r.ov.H_poche)+' x L '+fu(r.ov.L_poche)+ex+(r.pcs.some(p=>p.sa)?', marge '+fu(r.seam):', sans marge (rempli)')];
 let m=parseFloat($('v_meas').value);if(U==='in')m*=25.4;if(Math.abs(m-50)<0.2)m=50;const sc=(m>=40&&m<=60)?50/m:1;
 const d=new Date(),dt=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
 const named=r.pcs.map(p=>{const it=r.list.find(x=>x.n===p.name)||{};return Object.assign({},p,{name:r.T.title+' - '+(it.form?it.form+' - ':'')+(it.part||p.name),note:info[0],ann:it.ann||'',lbl:((it.form==='Rabat'?it.form:it.part)||''),fold:!!p.onFold,nograin:!(/^(Face avant|Poche|Devant)/.test(it.part||'')&&it.form!=='Rabat')})});
 const o=PatternPDF.build(named,{title:'Poche - patron A4 1:1',lines:info,scale:sc,date:dt});
 $('msg').textContent=o.warnings.join(' ');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([o.bytes],{type:'application/pdf'}));a.download='patron-poche.pdf';a.click()}
document.querySelectorAll('#v_seam,#v_meas').forEach(i=>i.addEventListener('input',draw));$('dl').onclick=download;const MEAS0=$('meashint').textContent,CAL0=$('calnote').textContent;
function updateUnitUi(init){const inch=U==='in';document.querySelectorAll('.ucm').forEach(e=>e.textContent=U);
 const sv=$('v_seam');sv.step=inch?'0.05':'0.1';sv.max=inch?'1.97':'5';if(init&&inch)sv.value=r2(fromCm(parseFloat(sv.value)));
 const mv=$('v_meas');mv.min=inch?'1.57':'40';mv.max=inch?'2.36':'60';mv.step=inch?'0.01':'0.5';if(init&&inch)mv.value='1.97';
 $('u_meas').textContent=inch?'in':'mm';$('meashint').textContent=inch?MEAS0.replace('50','1.97'):MEAS0;$('calnote').textContent=inch?CAL0.replace('48 mm','1.89 in'):CAL0}
function setUnit(nu){if(nu===U)return;
 const cmv={};FIELDS.forEach(([n,,u])=>{if(u!=='cm')return;const e=$('v_'+n);const v=e?parseFloat(e.value):parseFloat(keep[n]);cmv[n]=isNaN(v)?undefined:toCm(v)});
 const sv=parseFloat($('v_seam').value),seamCm=isNaN(sv)?NaN:toCm(sv);const mv=parseFloat($('v_meas').value),mm=isNaN(mv)?NaN:(U==='in'?mv*25.4:mv);
 U=nu;FIELDS.forEach(([n,,u])=>{if(u==='cm')keep[n]=cmv[n]===undefined?undefined:r2(fromCm(cmv[n]))});
 renderVars(true);updateUnitUi();
 $('v_seam').value=isNaN(seamCm)?'':r2(fromCm(seamCm));$('v_meas').value=isNaN(mm)?'':(U==='in'?r2(mm/25.4):String(Math.round(mm*10)/10));draw()}
if(UNIT_SELECT){$('unitbox').hidden=false;try{if(localStorage.getItem('unit')==='in')U='in'}catch(e){}
 document.querySelectorAll('input[name=un]').forEach(i=>{i.checked=i.value===U;i.addEventListener('change',()=>{setUnit(i.value);try{localStorage.setItem('unit',U)}catch(e){}})});updateUnitUi(true)}
renderRabats();setType('simple');
