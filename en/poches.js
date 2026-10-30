const DATA=window.PATTERN_DATA;
const TYPES={
 simple:{label:'Simple pocket (no gusset)',block:0,title:'Patch pocket',forms:[
  {id:'rect',label:'Rectangular',pieces:[['I.1','Pocket']]},
  {id:'cut',label:'Bevelled corners',pieces:[['I.2','Pocket']]},
  {id:'round',label:'Rounded corners',pieces:[['I.3','Pocket']]}]},
 lat:{label:'Pocket with side gusset',block:1,title:'Patch pocket with side gusset',extra:['Prof_soufflet_lat'],forms:[
  {id:'rect',label:'Rectangular',pieces:[['II.1.a','Front piece'],['II.1.b','Gusset strip 1','Sew onto the front piece.'],['II.1.c','Gusset strip 2','Sew onto gusset strip 1 and onto the garment.']]},
  {id:'cut',label:'Bevelled corners',pieces:[['II.2.a','Front piece'],['II.2.b','Gusset strip 1','Sew onto the front piece.'],['II.2.c','Gusset strip 2','Sew onto gusset strip 1 and onto the garment.']]},
  {id:'round',label:'Rounded corners',pieces:[['II.3.a','Front piece'],['II.3.b','Gusset strip 1','Sew onto the front piece.'],['II.3.c','Gusset strip 2','Sew onto gusset strip 1 and onto the garment.']]}]},
 cen:{label:'Pocket with centre pleat',block:2,title:'Patch pocket with centre pleat',extra:['Prof_pli_central'],forms:[
  {id:'rect',label:'Rectangular',pieces:[['III.1','Front piece','No integrated cuff facing: use the added cuff facing.']]},
  {id:'cut',label:'Bevelled corners',pieces:[['III.2','Front piece','No integrated cuff facing: use the added cuff facing.']]},
  {id:'round',label:'Rounded corners',pieces:[['III.3','Front piece','No integrated cuff facing: use the added cuff facing.']]}],
  common:[['Revers Ajouté','Added cuff facing','Sew onto the top of the front piece.']]},
 dbl:{label:'Double-gusset pocket (side gusset and centre pleat)',block:2,title:'Double-gusset patch pocket',extra:['Prof_soufflet_lat','Prof_pli_central'],forms:[
  {id:'rect',label:'Rectangular',pieces:[['III.1','Front piece (centre pleat)','No integrated cuff facing: use the added cuff facing.'],['II.1.b','Side gusset strip 1','Sew onto the front piece.',1],['II.1.c','Side gusset strip 2','Sew onto side gusset strip 1 and onto the garment.',1]]},
  {id:'cut',label:'Bevelled corners',pieces:[['III.2','Front piece (centre pleat)','No integrated cuff facing: use the added cuff facing.'],['II.2.b','Side gusset strip 1','Sew onto the front piece.',1],['II.2.c','Side gusset strip 2','Sew onto side gusset strip 1 and onto the garment.',1]]},
  {id:'round',label:'Rounded corners',pieces:[['III.3','Front piece (centre pleat)','No integrated cuff facing: use the added cuff facing.'],['II.3.b','Side gusset strip 1','Sew onto the front piece.',1],['II.3.c','Side gusset strip 2','Sew onto side gusset strip 1 and onto the garment.',1]]}],
  common:[['Revers Ajouté','Added cuff facing','Sew onto the top of the front piece.']]},
 sou1:{label:'Side-gusset pocket – one-piece variant',block:5,title:'Side-gusset pocket (one piece)',extra:['Prof_soufflet_lat'],defs:{Prof_soufflet_lat:4},forms:[
  {id:'rect',label:'Rectangular',pieces:[['Poche à soufflets latéraux (une pièce)','Pocket (front and gussets)']]}]},
 sou2:{label:'Double-gusset pocket (side gusset and centre pleat) – variant with separate gussets',block:5,title:'Double-gusset pocket (separate gussets)',extra:['Prof_soufflet_lat','Prof_pli_central'],defs:{Prof_soufflet_lat:4,Prof_pli_central:3.5},forms:[
  {id:'rect',label:'Rectangular',pieces:[['Devant de poche','Front (centre pleat)','No integrated cuff facing: use the added cuff facing.'],['Soufflet côté','Side gusset','Cut 2 identical pieces.'],['Soufflet bas','Bottom gusset']]}],
  common:[['Revers Ajouté','Added cuff facing','Sew onto the top of the front piece.',2]]}};
const FIELDS=[
 ['H_poche','Pocket height','cm',1,null],['L_poche','Pocket width','cm',1,null],
 ['A_biseau_entree','Opening slant (0 = straight)','°',1,null],
 ['H_revers','Cuff facing height','cm',0.1,null],['Val_repli_poche','Fold-under allowance (sides and bottom)','cm',0.1,'from 0 to 2 cm','simple lat cen dbl sou2'],
 ['GenRHP','Fold-under allowance at pocket top (proportion of cuff facing)','',0.05,'from 0 to 2','simple lat cen dbl sou2'],
 ['Prof_soufflet_lat','Side gusset depth','cm',0.1,null,'lat dbl sou1 sou2'],
 ['Prof_pli_central','Centre pleat depth','cm',0.1,null,'cen dbl sou2'],
 ['Prop_angle_coupe','Bevelled corner size','',0.01,null],
 ['Prop_angle_arrondi','Corner radius','',0.01,null],
 ['Prop_H_rabat','Flap height','',0.01,null,'rab'],['Add_L_rabat','Extra flap width','cm',0.1,null,'rab'],
 ['Prop_rabat_angle_coupe','Flap bevelled corner size','',0.01,null,'rab'],['Prop_rabat_angle_arrondi','Flap corner radius','',0.01,null,'rab']];
const RAB={rect:['Rabat rectangulaire','Rectangular'],cut:['Rabat chanfrein','Bevelled corners'],round:['Rabat arrondi','Rounded corners']};
const fm=v=>String(Math.round(v*10)/10);
const UNIT_SELECT=true;let U='cm';const K=2.54;
const r2=x=>String(Math.round(x*100)/100);
const toCm=x=>{if(U==='cm')return x;const c=x*K,s=Math.round(c*10)/10;return Math.abs(c-s)<0.03?s:c};/* snap : écarts < 0,3 mm dus à l'arrondi des pouces */
const fromCm=x=>U==='cm'?x:parseFloat(r2(x/K));
const stepOf=s=>U==='in'?(s>=1?0.5:0.05):s;
function cmx(s){if(U==='cm'||s==null)return s;const f=n=>r2(parseFloat(n)/K);
 return String(s).replace(/(\d+(?:\.\d+)?)(\s*(?:and|to|×|x)\s*)(\d+(?:\.\d+)?)(\s*)cm\b/g,(m,a,sep,b)=>f(a)+sep+f(b)+' in').replace(/(\d+(?:\.\d+)?)(\s*)cm\b/g,(m,a)=>f(a)+' in')}
const def={};DATA.variables.forEach(v=>def[v.name]=parseFloat(v.formula));
def.Prof_soufflet_lat=2;const dv=n=>{const T=TYPES[cur];return T&&T.defs&&T.defs[n]!==undefined?T.defs[n]:def[n]};/* default value valid for the three shapes */
const $=id=>document.getElementById(id);
let cur='simple';const keep={};
function hintOf(n,ty){const s=ty!=='simple';
 switch(n){
 case 'H_poche':return s?'from 8 to 50 cm':'from 5 to 50 cm';
 case 'L_poche':return s?'from 8 to 40 cm':'from 5 to 40 cm';
 case 'A_biseau_entree':return s?'0 only for gusseted pockets (straight opening)':'the taller the pocket, the greater the angle can be';
 case 'H_revers':return ty==='sou1'?'from 1.5 cm to half the height (10 cm maximum)':s?'at least 1.5 cm, at least 0.3 cm more than the fold-under allowance, and at most half the height (10 cm maximum)':'from 1.5 cm to half the pocket height';
 case 'Val_repli_poche':return 'from 0 to 2 cm';
 case 'Prop_H_rabat':return '(as a proportion of pocket height, from 0.1 to 0.4)';
 case 'Add_L_rabat':return 'from 0 to 3 cm (flap width = pocket width + this extra)';
 case 'Prop_rabat_angle_coupe':return '(as a proportion of flap height, from 0.05 to 0.6, up to a maximum of half the flap width)';
 case 'Prop_rabat_angle_arrondi':return '(as a proportion of flap height, from 0.05 to 0.6, up to a maximum of half the flap width)';
 case 'Prof_soufflet_lat':return (ty==='sou1'||ty==='sou2')?'from 0.5 cm to half the width':'from 0.5 cm to a quarter of the width, and at most 80 % of the radius (rounded corners)';
 case 'Prof_pli_central':return 'from 0.5 cm to a third of the width';
 case 'Prop_angle_coupe':return '(as a proportion of pocket height, from 0.02 to 0.45, up to a maximum of half the width)';
 case 'Prop_angle_arrondi':return ty==='lat'?'(as a proportion of pocket height, from 0.02 to 0.45, and radius ≤ 45 % of the width)':(ty==='cen'||ty==='dbl')?'(as a proportion of pocket height, from 0.02 to 0.45, and radius ≤ 30 % of the width)':'(as a proportion of pocket height, from 0.02 to 0.45, and radius ≤ half the width)';
 }return null}
function fieldHtml(n,l,u,s){const h0=hintOf(n,cur),h=h0&&cmx(h0),cm=u==='cm';return `<div class="fld" id="w_${n}"><label for="v_${n}">${l}${h?(h[0]==='('?`<small class="hint"> ${h}</small>`:`<small class="hint"> — ${h}</small>`):''}</label><div class="row"><input type="number" id="v_${n}" value="${keep[n]!==undefined?keep[n]:(cm?r2(fromCm(dv(n))):dv(n))}" step="${cm?stepOf(s):s}" min="0"><span class="u${cm?' ucm':''}">${cm?U:u}</span></div>${cm?`<div class="frac" id="f_${n}"></div>`:''}<div class="err" id="e_${n}"></div></div>`}
function renderVars(skip){if(!skip)FIELDS.forEach(([n])=>{const e=$('v_'+n);if(e)keep[n]=e.value});
 const ok=f=>f[5]!=='rab'&&(!f[5]||f[5].split(' ').includes(cur));
 $('vars').innerHTML=FIELDS.filter(ok).map(([n,l,u,s])=>fieldHtml(n,l,u,s)).join('');
 $('rvars').innerHTML=FIELDS.filter(f=>f[5]==='rab').map(([n,l,u,s])=>fieldHtml(n,l,u,s)).join('');
 document.querySelectorAll('#vars input,#rvars input').forEach(i=>i.addEventListener('input',draw))}
function renderRabats(){$('rabats').innerHTML='<label><input type="radio" name="rb" class="rb" value="none" checked> No flap</label>'+Object.keys(RAB).map(k=>`<label><input type="radio" name="rb" class="rb" value="${k}"> ${RAB[k][1]}</label>`).join('');
 document.querySelectorAll('.rb').forEach(i=>i.addEventListener('change',draw))}
function rabId(){const r=document.querySelector('.rb:checked');return r&&r.value!=='none'?r.value:null}
function renderForms(){const T=TYPES[cur];const was=[...document.querySelectorAll('.pc:checked')].map(c=>c.value);
 const pick=T.forms.some(f=>f.id===was[0]&&!f.off)?was[0]:'rect';$('pieces').innerHTML=T.forms.map(f=>`<label><input type="radio" name="pc" class="pc" value="${f.id}" ${f.off?'disabled':''} ${f.id===pick?'checked':''}> ${f.label}</label>`).join('');
 document.querySelectorAll('.pc').forEach(i=>i.addEventListener('change',draw))}
function hasSeam(){const {list}=chosen();return list.some(x=>{const p=DATA.blocks[x.blk].pieces.find(q=>q.name===x.n);return p&&p.seamAllowance})}
function show(e,on){if(e)e.style.display=on?'':'none'}
function syncFields(){const on=hasSeam();$('v_seam').disabled=!on;[document.querySelector('label[for=v_seam]'),$('r_seam'),$('f_seam'),$('e_seam')].forEach(e=>show(e,on));
 $('seamnote').textContent=on?'':'For this pocket, the fold-under allowance takes the place of a seam allowance: none is added.';if(!on){$('e_seam').textContent='';$('v_seam').classList.remove('bad')}
const rbv=rabId();[['Prop_H_rabat',!!rbv],['Add_L_rabat',!!rbv],['Prop_rabat_angle_coupe',rbv==='cut'],['Prop_rabat_angle_arrondi',rbv==='round']].forEach(([n,on])=>{const i=$('v_'+n);if(!i)return;i.disabled=!on;show($('w_'+n),on);if(!on){const e=$('e_'+n);if(e)e.textContent='';i.classList.remove('bad')}});
const f=document.querySelector('.pc:checked'),id=f?f.value:'rect';
 [['Prop_angle_coupe','cut'],['Prop_angle_arrondi','round']].forEach(([n,want])=>{const i=$('v_'+n);if(!i)return;const off=id!==want;i.disabled=off;show($('w_'+n),!off);if(off){const e=$('e_'+n);if(e)e.textContent='';i.classList.remove('bad')}})}
function setType(t){const prev=cur;FIELDS.forEach(([n])=>{const e=$('v_'+n);if(e)keep[n]=e.value});cur=t;
 FIELDS.forEach(([n])=>{const a=(TYPES[prev].defs||{})[n],b=(TYPES[t].defs||{})[n];if((a!==undefined||b!==undefined)&&keep[n]!==undefined&&Math.abs(parseFloat(keep[n])-fromCm(a!==undefined?a:def[n]))<1e-6)keep[n]=r2(fromCm(b!==undefined?b:def[n]))});
 renderVars(true);renderForms();$('typenote').textContent=t==='simple'?'':'For now: straight opening only.';draw()}
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
 if(ps.length){const [a,b]=span(ps);m.Prof_soufflet_lat='With these bevelled corners, the gusset depth must be between '+fm(a)+' and '+fm(b)+' cm (or reduce the bevelled corners).';return}
 const cs=[];for(let c=0.02;c<=0.4501;c+=0.01){const q=Math.round(c*100)/100;if(q*H<=L/2&&cutOK(Object.assign({},ov,{Prop_angle_coupe:q}),seam))cs.push(q)}
 m.Prop_angle_coupe=cs.length?'With this gusset depth, the bevelled corner size must be between '+fm(cs[0])+' and '+fm(cs[cs.length-1])+'.':'This combination of dimensions is not feasible: change the gusset depth, the fold-under allowance or the dimensions.'}
function check(ov,seam,forms){const m={},H=ov.H_poche,L=ov.L_poche,ty=cur,s=ty!=='simple',ids=forms.map(f=>f.id);
 const hmin=s?8:5,lmin=s?8:5;
 if(!(H>=hmin&&H<=50))m.H_poche='Between '+hmin+' and 50 cm.';
 if(!(L>=lmin&&L<=40))m.L_poche='Between '+lmin+' and 40 cm.';
 if(s){if(!(ov.A_biseau_entree===0))m.A_biseau_entree='Straight opening only for gusseted pockets (enter 0).'}
 else if(!(ov.A_biseau_entree>=0&&ov.A_biseau_entree<=40))m.A_biseau_entree='Between 0 and 40°.';
 else if(H>=5&&L>=5&&L*Math.tan(ov.A_biseau_entree*Math.PI/180)>0.5*H+1e-9)m.A_biseau_entree='Too steep for a pocket of '+fm(H)+' × '+fm(L)+' cm: '+fm(Math.min(40,Math.floor(Math.atan(0.5*H/L)*180/Math.PI*10)/10))+'° at most.';
 if(!(ov.Val_repli_poche>=0&&ov.Val_repli_poche<=2))m.Val_repli_poche='Between 0 and 2 cm.';
 if(!(ov.GenRHP>=0&&ov.GenRHP<=2))m.GenRHP='Between 0 and 2.';
 if(s){const lo=ty==='sou1'?1.5:Math.max(1.5,(ov.Val_repli_poche||0)+0.3),hi=Math.min(H/2,10);
  if(!(ov.H_revers>=lo-1e-9&&ov.H_revers<=hi+1e-9))m.H_revers=lo<=hi?'Between '+fm(Math.ceil(lo*10)/10)+' cm (fold-under allowance + 0.3 cm) and '+fm(hi)+' cm.':'Not possible with this fold-under allowance and height: reduce the allowance.'}
 else if(!(ov.H_revers>=1.5&&ov.H_revers<=H/2))m.H_revers='Between 1.5 cm and half the pocket height'+(H>=5?' (i.e. '+fm(H/2)+' cm at most).':'.');
 const rmax=ty==='lat'?0.45*L:(ty==='cen'||ty==='dbl')?0.3*L:L/2;
 if(ids.includes('cut')&&!(ov.Prop_angle_coupe>=0.02&&ov.Prop_angle_coupe<=0.45&&ov.Prop_angle_coupe*H<=L/2))m.Prop_angle_coupe='Between 0.02 and 0.45 (e.g. 0.25), and bevelled corner size ≤ half the width.';
 if(ids.includes('round')&&!(ov.Prop_angle_arrondi>=0.02&&ov.Prop_angle_arrondi<=0.45&&ov.Prop_angle_arrondi*H<=rmax+1e-9))m.Prop_angle_arrondi='Between 0.02 and 0.45 (e.g. 0.2), and radius ≤ '+fm(rmax)+' cm ('+(ty==='lat'?'45 %':ty!=='simple'?'30 %':'50 %')+' of the width).';
 if(ty==='lat'||ty==='dbl'){const pm=L/4;let lim=pm;if(ids.includes('round'))lim=Math.min(lim,0.8*ov.Prop_angle_arrondi*H);
  if(!(ov.Prof_soufflet_lat>=0.5&&ov.Prof_soufflet_lat<=lim+1e-9))m.Prof_soufflet_lat=lim>=0.5?'Between 0.5 and '+fm(Math.floor(lim*10)/10)+' cm for this pocket.':'Not possible with this radius: increase the radius or the height.'}
 if((ty==='sou1'||ty==='sou2')&&!(ov.Prof_soufflet_lat>=0.5&&ov.Prof_soufflet_lat<=L/2+1e-9))m.Prof_soufflet_lat='Between 0.5 and '+fm(Math.floor(L/2*10)/10)+' cm for this pocket.';
 if((ty==='cen'||ty==='dbl'||ty==='sou2')&&!(ov.Prof_pli_central>=0.5&&ov.Prof_pli_central<=L/3+1e-9))m.Prof_pli_central='Between 0.5 and '+fm(Math.floor(L/3*10)/10)+' cm for this width.';
 {const rb=rabId();if(rb){const fh=H*ov.Prop_H_rabat,fw=L+ov.Add_L_rabat;
  if(!(ov.Prop_H_rabat>=0.1&&ov.Prop_H_rabat<=0.4))m.Prop_H_rabat='Between 0.1 and 0.4.';
  if(!(ov.Add_L_rabat>=0&&ov.Add_L_rabat<=3))m.Add_L_rabat='Between 0 and 3 cm.';
  const pk=rb==='cut'?'Prop_rabat_angle_coupe':rb==='round'?'Prop_rabat_angle_arrondi':null;
  if(pk&&!(ov[pk]>=0.05&&ov[pk]<=0.6&&ov[pk]*fh<=fw/2+1e-9))m[pk]='Between 0.05 and 0.6, and at most half the flap width ('+fm(fw/2)+' cm here).'}}
 if(hasSeam()&&!(seam>=0&&seam<=5))m.seam='Between 0 and 5 cm.';
 if((ty==='lat'||ty==='dbl')&&ids.includes('cut')&&!Object.keys(m).length)cutFeasible(ov,seam,m);
 return m}
function showErrors(m){document.querySelectorAll('.err').forEach(e=>{e.textContent='';});document.querySelectorAll('.row input').forEach(i=>i.classList.remove('bad'));
 Object.keys(m).forEach(k=>{const e=$('e_'+k),i=$('v_'+k);if(e)e.textContent=cmx(m[k]);if(i)i.classList.add('bad')});return Object.keys(m).length>0}
function chosen(){const T=TYPES[cur];const forms=[...document.querySelectorAll('.pc:checked')].map(c=>T.forms.find(f=>f.id===c.value)).filter(Boolean);
 const list=[];forms.forEach(f=>f.pieces.forEach(([n,part,ann,blk])=>list.push({n,form:f.label.replace(/ \(.*\)$/,''),part,ann,blk:blk===undefined?T.block:blk})));
 if(forms.length)(T.common||[]).forEach(([n,part,ann,blk])=>{if(!list.some(x=>x.n===n))list.push({n,form:'',part,ann,blk:blk===undefined?T.block:blk})});
 const rb=rabId();if(rb)list.push({n:RAB[rb][0],form:'Flap',part:RAB[rb][1],ann:'Cut on the fold of the fabric. Do not sew between the notches (turning gap).',blk:4});
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
  if(mx>=0)showErrors({seam:'Seam allowance too large for this pocket: '+fm(mx)+' cm at most.'});else $('msg').textContent='';
  const e=new Error(mx>=0?'':'This combination of values does not give a feasible pattern: change the dimensions.');e.fieldErrors=mx>=0;throw e}
 return{pcs,seam,ov,list,T}}
function fracStr(x){if(!(x>=0))return '';const q=Math.round(x*16),w=Math.floor(q/16);let n=q%16,d=16;while(n&&n%2===0){n/=2;d/=2}
 const f=n?n+'/'+d:'';const s=w&&f?w+' '+f:(f||String(w));return (Math.abs(x*16-q)<0.02?'= ':'≈ ')+s+' in'}
function updateFracs(){document.querySelectorAll('.frac').forEach(e=>{if(U!=='in'){e.textContent='';return}const i=$('v_'+e.id.slice(2));const v=i?parseFloat(i.value):NaN;e.textContent=isNaN(v)?'':fracStr(v)})}
function draw(){syncFields();updateFracs();let r;try{r=compute()}catch(e){$('msg').textContent=e.fieldErrors?'Please correct the values marked in red.':cmx(e.message);$('dl').disabled=true;return}
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
function download(){let r;try{r=compute()}catch(e){$('msg').textContent=e.fieldErrors?'Please correct the values marked in red.':cmx(e.message);return}if(!r.pcs.length){$('msg').textContent='Please choose at least one shape.';return}
 const fu=v=>(U==='cm'?fm(v):r2(v/K))+' '+U;const exl={Prof_soufflet_lat:'side gusset',Prof_pli_central:'centre pleat'};const ex=(r.T.extra||[]).map(k=>', '+exl[k]+' '+fu(r.ov[k])).join('');
 const info=['H '+fu(r.ov.H_poche)+' x W '+fu(r.ov.L_poche)+ex+(r.pcs.some(p=>p.sa)?', seam allowance '+fu(r.seam):', no seam allowance (fold-under)')];
 let m=parseFloat($('v_meas').value);if(U==='in')m*=25.4;if(Math.abs(m-50)<0.2)m=50;const sc=(m>=40&&m<=60)?50/m:1;
 const d=new Date(),dt=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
 const named=r.pcs.map(p=>{const it=r.list.find(x=>x.n===p.name)||{};return Object.assign({},p,{name:r.T.title+' - '+(it.form?it.form+' - ':'')+(it.part||p.name),note:info[0],ann:it.ann||'',lbl:((it.form==='Flap'?it.form:it.part)||''),fold:!!p.onFold,nograin:!(/^(Face avant|Poche|Devant)/.test(it.part||'')&&it.form!=='Rabat')})});
 const o=PatternPDF.build(named,{title:'Pocket - A4 pattern 1:1',lines:info,scale:sc,date:dt});
 $('msg').textContent=o.warnings.join(' ');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([o.bytes],{type:'application/pdf'}));a.download='pocket-pattern.pdf';a.click()}
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
