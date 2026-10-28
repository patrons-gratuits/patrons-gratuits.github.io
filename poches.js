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
  common:[['Revers Ajouté','Revers ajouté','À coudre sur le haut de la face avant.']]}};
const FIELDS=[
 ['H_poche','Hauteur de la poche','cm',1,null],['L_poche','Largeur de la poche','cm',1,null],
 ['A_biseau_entree','Inclinaison de l’entrée (0 = droite)','°',1,null],
 ['H_revers','Hauteur du revers','cm',0.1,null],['Val_repli_poche','Rempli (côtés et fond)','cm',0.1,'de 0 à 2 cm'],
 ['GenRHP','Rempli haut de poche (proportion du revers)','',0.05,'de 0 à 2'],
 ['Prof_soufflet_lat','Profondeur du soufflet latéral','cm',0.1,null,'lat dbl'],
 ['Prof_pli_central','Profondeur du pli central','cm',0.1,null,'cen dbl'],
 ['Prop_angle_coupe','Chanfrein','',0.01,null],
 ['Prop_angle_arrondi','Rayon de l’arrondi','',0.01,null],
 ['Prop_H_rabat','Hauteur du rabat','',0.01,null,'rab'],['Add_L_rabat','Supplément de largeur du rabat','cm',0.1,null,'rab'],
 ['Prop_rabat_angle_coupe','Chanfrein du rabat','',0.01,null,'rab'],['Prop_rabat_angle_arrondi','Rayon de l’arrondi du rabat','',0.01,null,'rab']];
const RAB={rect:['Rabat rectangulaire','Rectangulaire'],cut:['Rabat chanfrein','Angles coupés'],round:['Rabat arrondi','Angles arrondis']};
const fm=v=>String(Math.round(v*10)/10).replace('.',',');
const def={};DATA.variables.forEach(v=>def[v.name]=parseFloat(v.formula));
def.Prof_soufflet_lat=2;/* valeur par défaut valable pour les trois formes */
const $=id=>document.getElementById(id);
let cur='simple';const keep={};
function hintOf(n,ty){const s=ty!=='simple';
 switch(n){
 case 'H_poche':return s?'de 8 à 50 cm':'de 5 à 50 cm';
 case 'L_poche':return s?'de 8 à 40 cm':'de 5 à 40 cm';
 case 'A_biseau_entree':return s?'0 uniquement pour les poches à soufflet (entrée droite)':'plus la hauteur est importante, plus l’angle peut être important';
 case 'H_revers':return s?'au moins 1,5 cm, plus grande que le rempli d’au moins 0,3 cm, et au plus la moitié de la hauteur (10 cm maximum)':'de 1,5 cm à la moitié de la hauteur de la poche';
 case 'Val_repli_poche':return 'de 0 à 2 cm';
 case 'Prop_H_rabat':return '(en proportion de la hauteur de poche, de 0,1 à 0,4)';
 case 'Add_L_rabat':return 'de 0 à 3 cm (largeur du rabat = largeur de poche + ce supplément)';
 case 'Prop_rabat_angle_coupe':return '(en proportion de la hauteur du rabat, de 0,05 à 0,6, avec un maximum de la moitié de la largeur du rabat)';
 case 'Prop_rabat_angle_arrondi':return '(en proportion de la hauteur du rabat, de 0,05 à 0,6, avec un maximum de la moitié de la largeur du rabat)';
 case 'Prof_soufflet_lat':return 'de 0,5 cm à un quart de la largeur, et au plus 80 % du rayon (angles arrondis)';
 case 'Prof_pli_central':return 'de 0,5 cm à un tiers de la largeur';
 case 'Prop_angle_coupe':return '(en proportion de la hauteur de poche, de 0,02 à 0,45 avec un maximum de la moitié de la largeur)';
 case 'Prop_angle_arrondi':return ty==='lat'?'(en proportion de la hauteur de poche, de 0,02 à 0,45, et rayon ≤ 45 % de la largeur)':(ty==='cen'||ty==='dbl')?'(en proportion de la hauteur de poche, de 0,02 à 0,45, et rayon ≤ 30 % de la largeur)':'(en proportion de la hauteur de poche, de 0,02 à 0,45, et rayon ≤ moitié de la largeur)';
 }return null}
function fieldHtml(n,l,u,s){const h=hintOf(n,cur);return `<label for="v_${n}">${l}${h?(h[0]==='('?`<small class="hint"> ${h}</small>`:`<small class="hint"> — ${h}</small>`):''}</label><div class="row"><input type="number" id="v_${n}" value="${keep[n]!==undefined?keep[n]:def[n]}" step="${s}" min="0"><span class="u">${u}</span></div><div class="err" id="e_${n}"></div>${n==='Val_repli_poche'?`<div class="legend"><span><svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke="var(--fold)" stroke-width="2" stroke-dasharray="6 4"/></svg> Repli (ligne discontinue bleue)</span></div>`:''}`}
function renderVars(){FIELDS.forEach(([n])=>{const e=$('v_'+n);if(e)keep[n]=e.value});
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
function syncFields(){const on=hasSeam();$('v_seam').disabled=!on;$('v_seam').style.opacity=on?1:.45;document.querySelector('label[for=v_seam]').style.opacity=on?1:.45;$("seamleg").style.display=on?'':'none';
 $('seamnote').textContent=on?'':'Pour cette poche, le rempli (replis) tient lieu de marge de couture : aucune marge n\u2019est ajoutée.';if(!on){$('e_seam').textContent='';$('v_seam').classList.remove('bad')}
const rbv=rabId();[['Prop_H_rabat',!!rbv],['Add_L_rabat',!!rbv],['Prop_rabat_angle_coupe',rbv==='cut'],['Prop_rabat_angle_arrondi',rbv==='round']].forEach(([n,on])=>{const i=$('v_'+n);if(!i)return;i.disabled=!on;const l=document.querySelector('label[for=v_'+n+']');if(l)l.style.opacity=on?1:.45;if(!on){const e=$('e_'+n);if(e)e.textContent='';i.classList.remove('bad')}});
const f=document.querySelector('.pc:checked'),id=f?f.value:'rect';
 [['Prop_angle_coupe','cut'],['Prop_angle_arrondi','round']].forEach(([n,want])=>{const i=$('v_'+n);if(!i)return;const off=id!==want;i.disabled=off;const l=document.querySelector('label[for=v_'+n+']');if(l)l.style.opacity=off?.45:1;if(off){const e=$('e_'+n);if(e)e.textContent='';i.classList.remove('bad')}})}
function setType(t){cur=t;renderVars();renderForms();$('typenote').textContent=t==='simple'?'':'Pour l\u2019instant : entr\u00e9e droite uniquement.';draw()}
$('type').innerHTML=Object.keys(TYPES).map(k=>`<option value="${k}">${TYPES[k].label}</option>`).join('');
$('type').addEventListener('change',()=>setType($('type').value));
function inputs(){const o={};FIELDS.forEach(([n])=>{const e=$('v_'+n);const v=e?parseFloat(e.value):NaN;o[n]=isNaN(v)?def[n]:v});
 const s=parseFloat($('v_seam').value);return{ov:o,seam:isNaN(s)?1:s}}
function segX(a,b,c,d){const o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return o(a,b,c)*o(a,b,d)<-1e-9&&o(c,d,a)*o(c,d,b)<-1e-9}
function selfX(P){const n=P.length;for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){if(i===0&&j===n-1)continue;if(segX(P[i],P[(i+1)%n],P[j],P[(j+1)%n]))return true}return false}
function cutOK(ov,seam){try{const bl=cur==='dbl'?[[1,['II.2.b','II.2.c']],[2,['III.2']]]:[[1,['II.2.a','II.2.b','II.2.c']]];return bl.every(([b,only])=>PatternEngine.computePieces(PatternEngine.computeBlock(DATA,b,ov),{seamWidth:seam,only}).every(p=>!selfX(p.poly)&&p.poly.every(q=>isFinite(q.x+q.y))&&(!p.sa||(!selfX(p.sa)&&p.sa.every(q=>isFinite(q.x+q.y))))))}catch(e){return false}}
function span(a){if(!a.length)return null;return[a[0],a[a.length-1]]}
function cutFeasible(ov,seam,m){const L=ov.L_poche,H=ov.H_poche;
 if(cutOK(ov,seam))return;
 const ps=[];for(let p=0.5;p<=L/4+1e-9;p+=0.1){const q=Math.round(p*10)/10;if(cutOK(Object.assign({},ov,{Prof_soufflet_lat:q}),seam))ps.push(q)}
 if(ps.length){const [a,b]=span(ps);m.Prof_soufflet_lat='Avec ce chanfrein, la profondeur de soufflet doit être comprise entre '+fm(a)+' et '+fm(b)+' cm (ou réduisez le chanfrein).';return}
 const cs=[];for(let c=0.02;c<=0.4501;c+=0.01){const q=Math.round(c*100)/100;if(q*H<=L/2&&cutOK(Object.assign({},ov,{Prop_angle_coupe:q}),seam))cs.push(q)}
 m.Prop_angle_coupe=cs.length?'Avec cette profondeur de soufflet, le chanfrein doit être compris entre '+fm(cs[0])+' et '+fm(cs[cs.length-1])+'.':'Cette combinaison de dimensions n\u2019est pas réalisable : modifiez la profondeur du soufflet, le rempli ou les dimensions.'}
function check(ov,seam,forms){const m={},H=ov.H_poche,L=ov.L_poche,ty=cur,s=ty!=='simple',ids=forms.map(f=>f.id);
 const hmin=s?8:5,lmin=s?8:5;
 if(!(H>=hmin&&H<=50))m.H_poche='Entre '+hmin+' et 50 cm.';
 if(!(L>=lmin&&L<=40))m.L_poche='Entre '+lmin+' et 40 cm.';
 if(s){if(!(ov.A_biseau_entree===0))m.A_biseau_entree='Entrée droite uniquement pour les poches à soufflet (mettre 0).'}
 else if(!(ov.A_biseau_entree>=0&&ov.A_biseau_entree<=40))m.A_biseau_entree='Entre 0 et 40°.';
 else if(H>=5&&L>=5&&L*Math.tan(ov.A_biseau_entree*Math.PI/180)>0.5*H+1e-9)m.A_biseau_entree='Trop forte pour une poche de '+fm(H)+' × '+fm(L)+' cm : '+fm(Math.min(40,Math.floor(Math.atan(0.5*H/L)*180/Math.PI*10)/10))+'° au maximum.';
 if(!(ov.Val_repli_poche>=0&&ov.Val_repli_poche<=2))m.Val_repli_poche='Entre 0 et 2 cm.';
 if(!(ov.GenRHP>=0&&ov.GenRHP<=2))m.GenRHP='Entre 0 et 2.';
 if(s){const lo=Math.max(1.5,(ov.Val_repli_poche||0)+0.3),hi=Math.min(H/2,10);
  if(!(ov.H_revers>=lo-1e-9&&ov.H_revers<=hi+1e-9))m.H_revers=lo<=hi?'Entre '+fm(Math.ceil(lo*10)/10)+' cm (rempli + 0,3 cm) et '+fm(hi)+' cm.':'Impossible avec ce rempli et cette hauteur : diminuez le rempli.'}
 else if(!(ov.H_revers>=1.5&&ov.H_revers<=H/2))m.H_revers='Entre 1,5 cm et la moitié de la hauteur de poche'+(H>=5?' (soit '+fm(H/2)+' cm au maximum).':'.');
 const rmax=ty==='lat'?0.45*L:(ty==='cen'||ty==='dbl')?0.3*L:L/2;
 if(ids.includes('cut')&&!(ov.Prop_angle_coupe>=0.02&&ov.Prop_angle_coupe<=0.45&&ov.Prop_angle_coupe*H<=L/2))m.Prop_angle_coupe='Entre 0,02 et 0,45 (par ex. 0,25), et chanfrein ≤ moitié de la largeur.';
 if(ids.includes('round')&&!(ov.Prop_angle_arrondi>=0.02&&ov.Prop_angle_arrondi<=0.45&&ov.Prop_angle_arrondi*H<=rmax+1e-9))m.Prop_angle_arrondi='Entre 0,02 et 0,45 (par ex. 0,2), et rayon ≤ '+fm(rmax)+' cm ('+(ty==='lat'?'45 %':ty!=='simple'?'30 %':'50 %')+' de la largeur).';
 if(ty==='lat'||ty==='dbl'){const pm=L/4;let lim=pm;if(ids.includes('round'))lim=Math.min(lim,0.8*ov.Prop_angle_arrondi*H);
  if(!(ov.Prof_soufflet_lat>=0.5&&ov.Prof_soufflet_lat<=lim+1e-9))m.Prof_soufflet_lat=lim>=0.5?'Entre 0,5 et '+fm(Math.floor(lim*10)/10)+' cm pour cette poche.':'Impossible avec ce rayon : augmentez le rayon ou la hauteur.'}
 if((ty==='cen'||ty==='dbl')&&!(ov.Prof_pli_central>=0.5&&ov.Prof_pli_central<=L/3+1e-9))m.Prof_pli_central='Entre 0,5 et '+fm(Math.floor(L/3*10)/10)+' cm pour cette largeur.';
 {const rb=rabId();if(rb){const fh=H*ov.Prop_H_rabat,fw=L+ov.Add_L_rabat;
  if(!(ov.Prop_H_rabat>=0.1&&ov.Prop_H_rabat<=0.4))m.Prop_H_rabat='Entre 0,1 et 0,4.';
  if(!(ov.Add_L_rabat>=0&&ov.Add_L_rabat<=3))m.Add_L_rabat='Entre 0 et 3 cm.';
  const pk=rb==='cut'?'Prop_rabat_angle_coupe':rb==='round'?'Prop_rabat_angle_arrondi':null;
  if(pk&&!(ov[pk]>=0.05&&ov[pk]<=0.6&&ov[pk]*fh<=fw/2+1e-9))m[pk]='Entre 0,05 et 0,6, et au plus la moitié de la largeur du rabat ('+fm(fw/2)+' cm ici).'}}
 if(hasSeam()&&!(seam>=0&&seam<=5))m.seam='Entre 0 et 5 cm.';
 if((ty==='lat'||ty==='dbl')&&ids.includes('cut')&&!Object.keys(m).length)cutFeasible(ov,seam,m);
 return m}
function showErrors(m){document.querySelectorAll('.err').forEach(e=>{e.textContent='';});document.querySelectorAll('.row input').forEach(i=>i.classList.remove('bad'));
 Object.keys(m).forEach(k=>{const e=$('e_'+k),i=$('v_'+k);if(e)e.textContent=m[k];if(i)i.classList.add('bad')});return Object.keys(m).length>0}
function chosen(){const T=TYPES[cur];const forms=[...document.querySelectorAll('.pc:checked')].map(c=>T.forms.find(f=>f.id===c.value)).filter(Boolean);
 const list=[];forms.forEach(f=>f.pieces.forEach(([n,part,ann,blk])=>list.push({n,form:f.label.replace(/ \(.*\)$/,''),part,ann,blk:blk===undefined?T.block:blk})));
 if(forms.length)(T.common||[]).forEach(([n,part,ann])=>{if(!list.some(x=>x.n===n))list.push({n,form:'',part,ann,blk:T.block})});
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
 if(isBad(pcs)){let mx=-1;for(let k=Math.ceil(seam*10)-1;k>=0;k--){if(!isBad(build(k/10))){mx=k/10;break}}
  if(mx>=0)showErrors({seam:'Marge de couture trop grande pour cette poche : '+fm(mx)+' cm au maximum.'});else $('msg').textContent='';
  const e=new Error(mx>=0?'':'Cette combinaison de valeurs ne donne pas un patron réalisable : modifiez les dimensions.');e.fieldErrors=mx>=0;throw e}
 return{pcs,seam,ov,list,T}}
function draw(){syncFields();let r;try{r=compute()}catch(e){$('msg').textContent=e.fieldErrors?'Corrigez les valeurs signalées en rouge.':e.message;$('dl').disabled=true;return}
 $('dl').disabled=false;
 $('msg').textContent='';const svg=$('prev');let off=0,y1=-1e9,out='';
 r.pcs.forEach(p=>{const it=r.list.find(x=>x.n===p.name);const pts=(p.sa||p.poly);const b=PatternEngine.bbox(pts);const dx=off-b.x0,dy=-b.y0;
  const P=a=>a.map(q=>(q.x+dx).toFixed(3)+','+(q.y+dy).toFixed(3)).join(' ');
  out+=`<polygon points="${P(p.poly)}" fill="none" stroke="currentColor" stroke-width=".06"/>`;
  if(p.sa)out+=`<polygon points="${P(p.sa)}" fill="none" stroke="var(--cut)" stroke-width=".1"/>`;
  (p.notches||[]).forEach(nt=>{const x2=nt.x-nt.nx*nt.len,y2=nt.y-nt.ny*nt.len;out+=`<line x1="${(nt.x+dx).toFixed(3)}" y1="${(nt.y+dy).toFixed(3)}" x2="${(x2+dx).toFixed(3)}" y2="${(y2+dy).toFixed(3)}" stroke="currentColor" stroke-width=".05"/>`});
  (p.internal||[]).forEach(l=>out+=`<polyline points="${P(l)}" fill="none" stroke="var(--fold)" stroke-width=".05" stroke-dasharray=".3 .2"/>`);
  out+=`<text x="${off}" y="-.4" font-size=".8" fill="currentColor">${it?((it.form?it.form+' – ':'')+it.part):p.name}</text>`;
  off+=b.w+2;y1=Math.max(y1,b.h)});
 svg.setAttribute('viewBox',`-1 -2 ${Math.max(off,5)} ${Math.max(y1,5)+3}`);svg.innerHTML=out}
function download(){let r;try{r=compute()}catch(e){$('msg').textContent=e.fieldErrors?'Corrigez les valeurs signalées en rouge.':e.message;return}if(!r.pcs.length){$('msg').textContent='Choisissez au moins une forme.';return}
 const exl={Prof_soufflet_lat:'soufflet latéral',Prof_pli_central:'pli central'};const ex=(r.T.extra||[]).map(k=>', '+exl[k]+' '+fm(r.ov[k])+' cm').join('');
 const info=['H '+r.ov.H_poche+' x L '+r.ov.L_poche+' cm'+ex+(r.pcs.some(p=>p.sa)?', marge '+r.seam+' cm':', sans marge (rempli)')];
 const m=parseFloat($('v_meas').value);const sc=(m>=40&&m<=60)?50/m:1;
 const d=new Date(),dt=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
 const named=r.pcs.map(p=>{const it=r.list.find(x=>x.n===p.name)||{};return Object.assign({},p,{name:r.T.title+' - '+(it.form?it.form+' - ':'')+(it.part||p.name),note:info[0],ann:it.ann||'',lbl:((it.form==='Rabat'?it.form:it.part)||''),fold:!!p.onFold})});
 const o=PatternPDF.build(named,{title:'Poche - patron A4 1:1',lines:info,scale:sc,date:dt});
 $('msg').textContent=o.warnings.join(' ');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([o.bytes],{type:'application/pdf'}));a.download='patron-poche.pdf';a.click()}
document.querySelectorAll('#v_seam,#v_meas').forEach(i=>i.addEventListener('input',draw));$('dl').onclick=download;renderRabats();setType('simple');
