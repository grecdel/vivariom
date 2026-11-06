// ================= VUE DU DESSUS REDESSINÉE, VERS ET SCOLOPENDRE, DÉCORS À L'ÉCHELLE =================
// Même style que la vue de côté : chaque bête vue d'en haut avec ses détails (élytres à points, ailes nervurées,
// antennes coudées, pinces, queue du scorpion…). Sert aussi aux vignettes du tiroir.

// ---------- outils ----------
const DAXE=c=>{const s=c.segs;if(s.length>1&&!c.sp.chain)return Math.atan2(s[0].y-s[1].y,s[0].x-s[1].x);return s[0].a??c.ang};
function pattesDessus(c,u,xs,len,w,col,ecart){const ph=(c.walkPh||0)*TAU*0.5+(c.phase||0),n=xs.length;for(let i=0;i<n;i++)for(const sd of [-1,1]){
  const f=n>1?1-2*i/(n-1):0,sw=Math.sin(ph+i*TAUP+(sd>0?TAUP:0))*0.25,x0=xs[i]*u,y0=sd*(ecart||0.6)*u,t1=sd*(TAUP/2-f*0.7)+sw,t2=sd*(TAUP/2-f*1.1)+sw;
  const kx=x0+Math.cos(t1)*len[0]*u,ky=y0+Math.sin(t1)*len[0]*u,fx=kx+Math.cos(t2)*len[1]*u,fy=ky+Math.sin(t2)*len[1]*u;
  segPatte(x0,y0,kx,ky,w*u,w*u*0.8,col);segPatte(kx,ky,fx,fy,w*u*0.7,w*u*0.35,col)}}
function antDessus(u,x,col,len,coude,massue){for(const sd of [-1,1]){const sx=x+len*0.45*u,sy=sd*len*(coude?0.25:0.3)*u;ctx.strokeStyle=col;ctx.lineWidth=u*0.14;ctx.beginPath();ctx.moveTo(x*u,sd*0.25*u);
  if(coude){ctx.lineTo(sx*u,sy);ctx.lineTo((x+len)*u,sd*len*0.55*u)}else ctx.quadraticCurveTo(sx,sy,(x+len)*u,sd*len*0.5*u);ctx.stroke();if(massue)ell((x+len)*u,sd*len*0.5*u,u*0.3,u*0.22,0,col)}}
function aileDessus(x,y,len,larg,ang,col){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(-len/2,0,len/2,larg,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(60,60,70,0.4)';ctx.lineWidth=larg*0.08;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-len*0.95,larg*0.1);ctx.moveTo(-len*0.3,0);ctx.lineTo(-len*0.7,larg*0.7);ctx.stroke();ctx.restore()}

function dessusBete(c,alpha){const id=c.sp.id,h=c.segs[0];const u=realLen(c)/c.sp.sf/10*(typeof ech==='function'?ech(c):1),v=c.sp.vid||'';
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(h.x,h.y);ctx.rotate(DAXE(c));ctx.lineCap='round';ctx.lineJoin='round';
  if(id==='fourmi'||id==='reine'){const K=couleursIns(c),R=id==='reine';pattesDessus(c,u,[0.2,-0.5,-1.2],[1.6,2.2],0.25,K.patte,0.4);
    ell(-1.2*u,0,u*0.7,u*0.45,0,K.thorax);ell(-2.3*u,0,u*0.35,u*0.3,0,K.thorax);ell(-4.0*u,0,u*(R?2.2:1.6),u*(R?1.5:1.15),0,K.abdo,K.fonce,u*0.08);
    if(R){ctx.globalAlpha=alpha*0.35;aileDessus(-1*u,0,6*u,1*u,0.15,'#e8e8f0');aileDessus(-1*u,0,6*u,1*u,-0.15,'#e8e8f0');ctx.globalAlpha=alpha}
    ell(0.6*u,0,u*0.95,u*0.85,0,K.tete,K.fonce,u*0.08);for(const sd of [-1,1]){trait([[1.3*u,sd*0.3*u],[1.9*u,sd*0.15*u]],K.fonce,u*0.25);ell(0.8*u,sd*0.6*u,u*0.2,u*0.15,0,'#050505')}
    antDessus(u,1.1,K.patte,2.2,true)}
  else if(id==='coccinelle'){const K=couleursIns(c);pattesDessus(c,u,[0.4,-0.6,-1.6],[1.0,1.0],0.25,K.patte,1.6);
    if(c.fly){ctx.globalAlpha=alpha*0.5;aileDessus(-1*u,0,6*u,1.6*u,0.6,'#dde');aileDessus(-1*u,0,6*u,1.6*u,-0.6,'#dde');ctx.globalAlpha=alpha}
    const o=c.fly?0.5:0;for(const sd of [-1,1]){ctx.save();ctx.rotate(sd*o);ctx.fillStyle=K.elytre;ctx.beginPath();ctx.ellipse(-1.6*u,0,u*2.6,u*2.4,0,sd>0?0:TAUP,sd>0?TAUP:TAU);ctx.closePath();ctx.fill();ctx.restore()}
    trait([[0.6*u,0],[-4.2*u,0]],'#111',u*0.12);
    const pts=v.includes('2pts')?[[-1.6,1.2]]:v.includes('asiatique')?[[-0.6,1],[-1.6,1.7],[-2.6,1.0],[-1.8,0.5],[-3.2,0.4]]:[[-0.6,1.2],[-2.0,1.6],[-2.8,0.7]];
    for(const [dx,dy] of pts)for(const sd of [-1,1])ell(dx*u,sd*dy*u,u*0.45,u*0.45,0,K.point);if(!v.includes('2pts'))ell(0.4*u,0,u*0.4,u*0.4,0,K.point);
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.ellipse(-0.8*u,-1.1*u,u*1.0,u*0.4,0.4,0,TAU);ctx.fill();
    ell(1.1*u,0,u*0.75,u*1.3,0,K.pronotum);for(const sd of [-1,1])ell(1.1*u,sd*0.75*u,u*0.3,u*0.35,0,K.blanc);ell(1.9*u,0,u*0.5,u*0.7,0,K.pronotum)}
  else if(id==='mouche'||id==='moustique'){const mou=id==='mouche',K=mou?couleursIns(c):{corps:hsl(30,15,40),oeil:'#2a2018',patte:'#3a3020',aile:'rgba(225,235,250,0.4)'};
    pattesDessus(c,u,[0.2,-0.6,-1.4],mou?[1.4,1.6]:[3,4],mou?0.22:0.08,K.patte,0.5);
    const b=c.fly?Math.sin(simT*55+(c.phase||0)*7)*0.4:0;aileDessus(-0.8*u,0,(mou?5.5:5)*u,(mou?1.3:0.8)*u,0.35+b,K.aile);aileDessus(-0.8*u,0,(mou?5.5:5)*u,(mou?1.3:0.8)*u,-0.35-b,K.aile);
    ell(-2.6*u,0,u*(mou?1.9:2.6),u*(mou?1.3:0.5),0,K.corps);if(K.reflet){ctx.globalAlpha=alpha*0.5;ell(-2.8*u,-0.4*u,u*1.1,u*0.4,0,K.reflet);ctx.globalAlpha=alpha}
    ell(-0.4*u,0,u*(mou?1.2:0.8),u*(mou?1.1:0.6),0,K.corps);if(mou){ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=u*0.12;for(const sd of [-1,0,1]){ctx.beginPath();ctx.moveTo(0.4*u,sd*0.4*u);ctx.lineTo(-1.2*u,sd*0.4*u);ctx.stroke()}}
    ell(0.9*u,0,u*0.6,u*0.9,0,K.corps);if(mou)for(const sd of [-1,1])ell(1.0*u,sd*0.6*u,u*0.55,u*0.5,0,K.oeil);else trait([[1.2*u,0],[3*u,0]],K.oeil,u*0.12)}
  else if(id==='abeille'){const K=couleursIns(c);pattesDessus(c,u,[0.2,-0.5,-1.3],[1.4,1.9],0.25,K.patte,0.6);
    const b=c.fly?Math.sin(simT*50+(c.phase||0)*7)*0.4:0;aileDessus(-0.6*u,0,5*u,1.1*u,0.4+b,K.aile);aileDessus(-0.6*u,0,5*u,1.1*u,-0.4-b,K.aile);
    ctx.save();ctx.beginPath();ctx.ellipse(-3*u,0,u*2.2,u*1.5,0,0,TAU);ctx.clip();for(let q=0;q<5;q++){ctx.fillStyle=K.bandes[q%K.bandes.length];ctx.fillRect((-1-q*0.9)*u,-2*u,0.9*u,4*u)}ctx.restore();
    ell(-0.5*u,0,u*1.3,u*1.2,0,K.thorax);if(K.poil){ctx.strokeStyle=K.poil;ctx.lineWidth=u*0.12;ctx.beginPath();for(let q=0;q<12;q++){const a=q/12*TAU;ctx.moveTo(-0.5*u+Math.cos(a)*u*1.1,Math.sin(a)*u*1.0);ctx.lineTo(-0.5*u+Math.cos(a)*u*1.5,Math.sin(a)*u*1.4)}ctx.stroke()}
    ell(1.0*u,0,u*0.7,u*0.9,0,K.fonce);for(const sd of [-1,1])ell(1.1*u,sd*0.55*u,u*0.4,u*0.35,0,'#1a1410');antDessus(u,1.5,K.fonce,1.6,!v.includes('syrphe'))}
  else if(id==='mante'){const K=couleursIns(c);pattesDessus(c,u,[-1.5,-2.5],[2.2,3],0.12,K.fonce,0.4);
    ell(-4.2*u,0,u*3.2,u*0.8,0,K.clair);ctx.fillStyle=K.corps;ctx.beginPath();ctx.ellipse(-3.8*u,0,u*3.4,u*0.55,0,0,TAU);ctx.fill();
    segPatte(-1*u,0,1.6*u,0,u*0.45,u*0.4,K.corps);// prothorax
    for(const sd of [-1,1]){segPatte(0.8*u,sd*0.3*u,1.8*u,sd*0.9*u,u*0.35,u*0.3,K.corps);segPatte(1.8*u,sd*0.9*u,1.4*u,sd*0.35*u,u*0.22,u*0.16,K.clair)}
    ctx.fillStyle=K.corps;ctx.beginPath();ctx.moveTo(2.6*u,0);ctx.lineTo(1.7*u,-0.8*u);ctx.lineTo(1.7*u,0.8*u);ctx.closePath();ctx.fill();for(const sd of [-1,1])ell(1.8*u,sd*0.7*u,u*0.3,u*0.25,0,K.oeil);antDessus(u,2.4,K.fonce,2.2,false)}
  else if(id==='grillon'||id==='tenebrion'||id==='bousier'||id==='rhinoceros'||id==='gendarme'||id==='perce'){const K=id==='grillon'?couleursIns(c):id==='gendarme'?{elytre:hsl(4,80,45),pronotum:'#111',patte:'#111',reflet:'#f88'}:id==='perce'?{elytre:hsl(15,50,25),pronotum:hsl(25,45,40),patte:hsl(25,45,45),reflet:hsl(25,45,55)}:couleursIns(c);
    const gr=id==='grillon',bou=id==='bousier';if(gr){for(const sd of [-1,1]){segPatte(-1.5*u,sd*0.8*u,-3.6*u,sd*1.9*u,u*0.8,u*0.5,K.patte||'#1e1a16');segPatte(-3.6*u,sd*1.9*u,-5.8*u,sd*1.4*u,u*0.3,u*0.2,K.patte||'#1e1a16')}pattesDessus(c,u,[0.3,-0.6],[1.3,1.5],0.22,'#1e1a16',0.8)}
    else pattesDessus(c,u,[0.3,-0.7,-1.8],[1.3,1.6],bou?0.35:0.25,K.patte||K.fonce,1.2);
    const col=gr?K.corps:K.elytre;ell(-2.0*u,0,u*(id==='perce'?2.6:3),u*(bou?2.2:id==='perce'?0.9:1.6),0,col,gr?'#4a443c':K.reflet,u*0.1);
    if(gr){ctx.fillStyle=K.aile;ctx.beginPath();ctx.ellipse(-1.8*u,0,u*2.6,u*1.1,0,0,TAU);ctx.fill();for(const sd of [-1,1])trait([[-4.8*u,sd*0.3*u],[-6.2*u,sd*0.8*u]],'#000',u*0.15)}
    else if(id==='gendarme'){ctx.fillStyle='#111';for(const [x,y,r] of [[-1.2,0,0.5],[-2.6,0.8,0.45],[-2.6,-0.8,0.45],[-3.8,0,0.4]]){ctx.beginPath();ctx.arc(x*u,y*u,r*u,0,TAU);ctx.fill()}}
    else if(id==='perce'){for(let q=0;q<5;q++)trait([[(-1-q*0.7)*u,-0.8*u],[(-1-q*0.7)*u,0.8*u]],'rgba(0,0,0,0.4)',u*0.06);for(const sd of [-1,1]){ctx.strokeStyle=K.pronotum;ctx.lineWidth=u*0.25;ctx.beginPath();ctx.moveTo(-4.4*u,sd*0.3*u);ctx.quadraticCurveTo(-5.8*u,sd*0.9*u,-6*u,sd*0.1*u);ctx.stroke()}}
    else{trait([[-0.1*u,0],[-4.9*u,0]],'rgba(0,0,0,0.5)',u*0.1);ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=u*0.06;for(const sd of [-1,1])for(let q=1;q<3;q++){ctx.beginPath();ctx.ellipse(-2*u,0,u*3*(1-q*0.25),u*(bou?2.2:1.6)*(1-q*0.3),0,sd>0?0.2:TAUP+0.2,sd>0?TAUP-0.2:TAU-0.2);ctx.stroke()}ctx.globalAlpha=alpha*0.35;ell(-1.6*u,-0.7*u,u*1.4,u*0.35,0.2,K.reflet);ctx.globalAlpha=alpha}
    ell(0.6*u,0,u*1.1,u*(bou?1.8:1.2),0,K.pronotum,K.reflet,u*0.08);ell(1.6*u,0,u*0.6,u*0.75,0,K.pronotum);
    if(bou){ctx.fillStyle=K.pronotum;ctx.beginPath();ctx.ellipse(2.0*u,0,u*0.6,u*1.5,0,-TAUP/2,TAUP/2);ctx.fill();for(let q=-2;q<=2;q++)trait([[2.5*u,q*0.35*u],[2.9*u,q*0.4*u]],K.pronotum,u*0.12)}
    if(id==='rhinoceros'){segPatte(1.6*u,0,3.4*u,0,u*0.6,u*0.2,K.pronotum)}
    antDessus(u,1.9,gr?'#000':K.patte||'#222',gr?6:id==='perce'||id==='tenebrion'?2:0.9,false,!gr&&id!=='perce'&&id!=='tenebrion')}
  else if(id==='scorpion'){const uv=typeof uvOn==='function'&&uvOn(),co=uv?'#7dffe8':hsl(48,55,58),fo=uv?'#2ad8c0':hsl(40,45,32);if(uv){ctx.shadowColor='#4dfff0';ctx.shadowBlur=u*2}
    pattesDessus(c,u,[0.2,-0.6,-1.4,-2.2],[1.8,2.2],0.25,co,1.0);ell(-1.2*u,0,u*2.6,u*1.3,0,co,fo,u*0.1);for(let q=-1;q<=2;q++)trait([[(-1-q*0.8)*u,-1.1*u],[(-1-q*0.8)*u,1.1*u]],fo,u*0.06);
    let px=-3.6*u,py=0;const sw=Math.sin(simT*1.3+(c.phase||0))*0.15;for(let q=0;q<5;q++){const nx=px-0.9*u*Math.cos(q*0.25+sw),ny=py+0.9*u*Math.sin(q*0.15+sw);segPatte(px,py,nx,ny,u*(0.7-q*0.06),u*(0.65-q*0.06),co);px=nx;py=ny}
    ell(px-0.4*u,py,u*0.5,u*0.4,0,co,fo,u*0.06);trait([[px-0.8*u,py],[px-1.2*u,py+0.4*u]],'#3a2010',u*0.15);
    for(const sd of [-1,1]){segPatte(0.8*u,sd*0.5*u,1.8*u,sd*1.6*u,u*0.35,u*0.35,co);ell(2.8*u,sd*1.5*u,u*1.0,u*0.5,sd*0.4,co,fo,u*0.06);trait([[3.6*u,sd*1.3*u],[4.3*u,sd*1.1*u]],fo,u*0.2);trait([[3.6*u,sd*1.7*u],[4.2*u,sd*1.6*u]],fo,u*0.16)}}
  else if(id==='papillon'){const vo=c.fly,b=vo?Math.abs(Math.sin(simT*18+(c.phase||0)*7)):1,ORANGE=hsl(20,85,52),NOIR='#1a1410',BLEU=hsl(215,75,58);
    for(const sd of [-1,1]){ctx.save();ctx.scale(1,sd*(0.25+0.75*b));ctx.fillStyle=ORANGE;ctx.beginPath();ctx.moveTo(0.2*u,0);ctx.quadraticCurveTo(1.6*u,3.2*u,-0.6*u,5.4*u);ctx.quadraticCurveTo(-2.4*u,4*u,-1.2*u,0.4*u);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(-1*u,0.3*u);ctx.quadraticCurveTo(-4*u,2.6*u,-3.6*u,4*u);ctx.quadraticCurveTo(-2*u,4.4*u,-0.6*u,0.6*u);ctx.closePath();ctx.fill();
      ctx.fillStyle=NOIR;for(const [x,y,r] of [[-0.2,2,0.4],[-0.4,3.4,0.35],[0.4,4.4,0.55],[-1.4,1.6,0.3]]){ctx.beginPath();ctx.arc(x*u,y*u,r*u,0,TAU);ctx.fill()}
      ctx.fillStyle=BLEU;for(let q=0;q<4;q++){ctx.beginPath();ctx.arc((-1.6-q*0.5)*u,(3.0+q*0.25)*u,0.18*u,0,TAU);ctx.fill()}ctx.strokeStyle=NOIR;ctx.lineWidth=u*0.12;ctx.beginPath();ctx.moveTo(0.2*u,0);ctx.quadraticCurveTo(1.6*u,3.2*u,-0.6*u,5.4*u);ctx.stroke();ctx.restore()}
    segPatte(-2.8*u,0,0.6*u,0,u*0.5,u*0.6,'#2a2018');ell(1*u,0,u*0.45,u*0.45,0,'#2a2018');for(const sd of [-1,1]){trait([[1.2*u,sd*0.2*u],[3*u,sd*1.2*u]],NOIR,u*0.08);ell(3*u,sd*1.2*u,u*0.15,u*0.15,0,NOIR)}}
  else if(id==='phasme'){const feu=v.includes('feuille'),per=v.includes('peruvien'),gea=v.includes('geant'),epi=v.includes('epineux');const col=per?'#151515':gea?hsl(100,55,36):feu?hsl(95,55,40):epi?hsl(35,40,38):hsl(c.sp.h,c.sp.s*0.6,Math.max(20,c.sp.l*0.7));
    pattesDessus(c,u,[1.4,0.3,-0.8],[2.4,2.6],feu||gea?0.2:0.12,col,0.4);
    if(feu){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0.6*u,0);ctx.quadraticCurveTo(-2*u,2.6*u,-5*u,0);ctx.quadraticCurveTo(-2*u,-2.6*u,0.6*u,0);ctx.fill();ctx.strokeStyle=hsl(90,55,62);ctx.lineWidth=u*0.08;ctx.beginPath();ctx.moveTo(0.4*u,0);ctx.lineTo(-4.8*u,0);for(let q=1;q<5;q++){const x=-q*0.95*u;ctx.moveTo(x,0);ctx.lineTo(x-0.6*u,1.4*u);ctx.moveTo(x,0);ctx.lineTo(x-0.6*u,-1.4*u)}ctx.stroke()}
    else{segPatte(-5*u,0,2*u,0,u*(gea?1.0:per?0.6:0.35),u*(gea?1.3:per?0.8:0.5),col);if(gea||epi){ctx.strokeStyle=hsl(gea?100:35,40,22);ctx.lineWidth=u*0.1;ctx.beginPath();for(let q=0;q<8;q++){const x=(-4.4+q*0.8)*u;for(const sd of [-1,1]){ctx.moveTo(x,sd*0.5*u);ctx.lineTo(x-0.2*u,sd*0.9*u)}}ctx.stroke()}if(per)for(const sd of [-1,1])ell(0.2*u,sd*0.55*u,u*0.6,u*0.25,0,'#d42a1c')}
    ell(2.4*u,0,u*0.5,u*0.4,0,col);for(const sd of [-1,1])ell(2.5*u,sd*0.3*u,u*0.14,u*0.14,0,per?'#f0d020':'#2a1a0a');antDessus(u,2.8,col,feu?0.9:2.4,false)}
  else if(id==='libellule'){const b=c.fly?Math.sin(simT*26+(c.phase||0)*7)*0.15:0;for(const [x,ang] of [[0,0],[-1.2,0]])for(const sd of [-1,1]){ctx.save();ctx.translate(x*u,0);ctx.rotate(sd*(TAUP/2+b)*(x?1.1:0.9));ctx.fillStyle='rgba(225,235,250,0.4)';ctx.beginPath();ctx.ellipse(4*u,0,4*u,0.7*u,0,0,TAU);ctx.fill();ctx.fillStyle='#2a2a2a';ctx.fillRect(7.2*u,-0.2*u,0.4*u,0.25*u);ctx.restore()}
    segPatte(-7*u,0,0,0,u*0.6,u*0.9,hsl(205,40,55));ell(0.6*u,0,u*0.9,u*0.8,0,hsl(80,25,35));for(const sd of [-1,1])ell(1.7*u,sd*0.55*u,u*0.7,u*0.6,0,hsl(200,45,40))}
  else if(id==='gerris'){const co=hsl(30,15,22);for(const sd of [-1,1]){trait([[0.6*u,sd*0.2*u],[1.6*u,sd*0.6*u]],co,u*0.15);trait([[0,sd*0.3*u],[1.2*u,sd*4*u],[3.5*u,sd*5*u]],co,u*0.1);trait([[-0.6*u,sd*0.3*u],[-3*u,sd*3.5*u],[-6*u,sd*4*u]],co,u*0.1)}
    segPatte(-3*u,0,1.6*u,0,u*0.6,u*0.6,co);ell(2*u,0,u*0.4,u*0.35,0,co)}
  else if(id==='cloporte'){const co=v.includes('mousse')?hsl(30,40,40):v.includes('boule')?hsl(220,8,32):hsl(220,10,42);pattesDessus(c,u,[0.4,-0.6,-1.6,-2.6],[0.9,0.8],0.18,hsl(220,10,25),1.6);
    ell(-1.4*u,0,u*3.6,u*2.0,0,co);ctx.strokeStyle='rgba(0,0,0,0.4)';ctx.lineWidth=u*0.1;for(let q=0;q<7;q++){const x=(1.6-q*0.85)*u,w=2.0*Math.sqrt(Math.max(0,1-((x/u+1.4)/3.6)**2));ctx.beginPath();ctx.moveTo(x,-w*u);ctx.quadraticCurveTo(x+0.25*u,0,x,w*u);ctx.stroke()}
    ctx.globalAlpha=alpha*0.3;ell(-1.4*u,-0.6*u,u*2.2,u*0.4,0,'#fff');ctx.globalAlpha=alpha;antDessus(u,1.8,hsl(220,10,25),1.8,true)}
  ctx.restore()}
const DESSUS_IDS=['fourmi','reine','coccinelle','mouche','moustique','abeille','mante','grillon','tenebrion','bousier','rhinoceros','gendarme','perce','scorpion','papillon','phasme','libellule','gerris','cloporte'];
{const dcr=drawCreature;drawCreature=function(c,alpha,gray,preview){if(gray||!ANAT||!DESSUS_IDS.includes(c.sp.id)||c.stade||!c.segs||!c.segs[0]){dcr(c,alpha,gray,preview);return}
  try{dessusBete(c,alpha)}catch(e){dcr(c,alpha,gray,preview)}}}

// ---------- vers et scolopendre, vue de côté (le corps suit la forme du chemin) ----------
function corpsLisse(pts,r0,r1,col){const n=pts.length;if(n<2)return;ctx.lineCap='round';for(let i=0;i<n-1;i++){const t=i/(n-1),w=r0+(r1-r0)*t;ctx.strokeStyle=col;ctx.lineWidth=w*2;ctx.beginPath();ctx.moveTo(pts[i][0],pts[i][1]);ctx.lineTo(pts[i+1][0],pts[i+1][1]);ctx.stroke()}}
function verCote(c,alpha){const F=c.sp.sf,id=c.sp.id,pts=c.segs.map(s=>[s.x*F,s.y*F]),L=realLen(c)*(typeof ech==='function'?ech(c):1),r=L*(id==='lombric'?0.035:id==='verfarine'?0.07:0.12);
  ctx.save();ctx.globalAlpha=alpha;
  if(id==='verblanc'){// larve en C, tête brune, 6 pattes
    const x=pts[0][0],y=pts[0][1],m=Math.cos(c.ang)>=0?1:-1,R=L*0.28;ctx.strokeStyle=hsl(45,30,82);ctx.lineWidth=R*0.9;ctx.lineCap='round';ctx.beginPath();ctx.arc(x-m*R,y-R*0.2,R,m>0?-0.4:Math.PI+0.4,m>0?Math.PI*1.35:-Math.PI*0.35,m<0);ctx.stroke();
    ctx.strokeStyle=hsl(40,25,65);ctx.lineWidth=R*0.06;for(let q=0;q<9;q++){const a=(m>0?-0.4:Math.PI+0.4)+(m>0?1:-1)*q*0.2;ctx.beginPath();ctx.moveTo(x-m*R+Math.cos(a)*R*0.6,y-R*0.2+Math.sin(a)*R*0.6);ctx.lineTo(x-m*R+Math.cos(a)*R*1.4,y-R*0.2+Math.sin(a)*R*1.4);ctx.stroke()}
    ell(x+m*R*0.15,y-R*0.1,R*0.42,R*0.38,0,hsl(25,55,35));for(let q=0;q<3;q++)trait([[x-m*R*(0.2+q*0.25),y+R*0.3],[x-m*R*(0.1+q*0.25),y+R*0.75]],hsl(25,50,40),R*0.1)}
  else if(id==='scolopendre'){const co=hsl(c.sp.h,c.sp.s*0.7,Math.max(20,c.sp.l*0.75)),fo=hsl(c.sp.h,40,15),pa=hsl(50,70,55);
    for(let i=1;i<pts.length;i++){const [x,y]=pts[i],[px,py]=pts[i-1],a=Math.atan2(y-py,x-px)+TAUP/2,sw=Math.sin((c.walkPh||0)*TAU+i*1.3)*0.4;for(const sd of [-1,1]){ctx.globalAlpha=alpha*(sd<0?0.5:1);trait([[x,y],[x+Math.cos(a+sd*0.2+sw*sd)*r*1.4,y+r*1.1],[x+Math.cos(a+sd*0.2+sw*sd)*r*2.0,y+r*1.9]],pa,r*0.16)}}ctx.globalAlpha=alpha;
    for(let i=pts.length-1;i>=0;i--){ell(pts[i][0],pts[i][1]-r*0.2,r*1.3,r*0.85,0,i%2?co:fo)}
    const [hx,hy]=pts[0],[nx,ny]=pts[1]||pts[0],a=Math.atan2(hy-ny,hx-nx);ell(hx+Math.cos(a)*r,hy+Math.sin(a)*r-r*0.2,r*1.1,r*0.8,0,hsl(c.sp.h,c.sp.s,c.sp.l*0.6));
    trait([[hx+Math.cos(a)*r*1.8,hy],[hx+Math.cos(a)*r*2.6,hy+r*0.7]],'#2a0a0a',r*0.45);// forcipules
    for(const d of [-0.5,0.5])trait([[hx+Math.cos(a)*r*1.8,hy-r*0.4],[hx+Math.cos(a+d*0.3)*r*4,hy-r*1.6-d*r],[hx+Math.cos(a)*r*6,hy-r*1.2-d*r]],pa,r*0.12);
    const [tx,ty]=pts[pts.length-1];for(const d of [0,0.6])trait([[tx,ty],[tx-Math.cos(a)*r*4,ty+r*(0.2+d)]],pa,r*0.16)}
  else{const col=id==='lombric'?hsl(350,40,55):hsl(42,70,55),fo=id==='lombric'?hsl(350,35,40):hsl(35,60,35),n=pts.length;corpsLisse(pts,r*1.05,r*0.75,col);
    ctx.strokeStyle=fo;ctx.lineWidth=r*0.22;for(let i=1;i<n-1;i++){const [x,y]=pts[i],[px,py]=pts[i-1],a=Math.atan2(y-py,x-px)+TAUP/2;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x-Math.cos(a)*r,y-Math.sin(a)*r);ctx.stroke()}
    if(id==='lombric'&&n>4){const i=Math.floor(n*0.3);ctx.strokeStyle=hsl(10,45,62);ctx.lineWidth=r*2.5;ctx.beginPath();ctx.moveTo(pts[i][0],pts[i][1]);ctx.lineTo(pts[i+1][0],pts[i+1][1]);ctx.stroke()}
    else if(id==='verfarine'){const [hx,hy]=pts[0];ell(hx,hy,r*0.9,r*0.85,0,hsl(30,60,30));for(let q=1;q<=3;q++){const [x,y]=pts[Math.min(n-1,q)];trait([[x,y+r*0.6],[x,y+r*1.4]],hsl(30,50,35),r*0.25)}}
    ctx.globalAlpha=alpha*0.35;ctx.strokeStyle='#fff';ctx.lineWidth=r*0.3;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y-r*0.5):ctx.moveTo(x,y-r*0.5));ctx.stroke()}
  ctx.restore()}
{const dp=drawProfile;drawProfile=function(c,alpha,gray){if(!gray&&ANAT&&['lombric','verfarine','verblanc','scolopendre'].includes(c.sp.id)&&c.segs&&c.segs.length>1&&c.state!=='nymphe'&&c.state!=='caught'){verCote(c,alpha);return}dp(c,alpha,gray)}}

// ---------- les décors déjà posés passent eux aussi à la bonne taille ----------
{const rs=restore;restore=function(S){rs(S);let ch=false;for(const d of decos){const D=DECOS[d.type];if(D&&d.w<D.w){d.w=D.w;ch=true}if(d.type==='tronc'&&d.h<90){d.h=d.h*1.8;ch=true}}if(ch){try{decoSettle()}catch(e){}}}}
