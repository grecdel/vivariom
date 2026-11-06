import re
src=open('vivarium.html').read()
def fn(name):
    i=src.index('function '+name+'(')
    j=src.index('{',i);d=0
    for k in range(j,len(src)):
        if src[k]=='{':d+=1
        elif src[k]=='}':
            d-=1
            if d==0:return src[i:k+1]
    raise Exception(name)
parts=[fn(n) for n in ['angDiff','segDist','colors','restPos','kneeOf','local','pulseAt','glowSprite','shapePath','drawWings','drawFeatures','drawSegPattern','drawCreature','drawTag','drawWaves']]
lib='\n'.join(parts)
lib=lib.replace("flying=!gray&&c.alt>1","flying=false").replace("air=preview||c.alt>3","air=preview||c.fly")
# style « fin » / « naturel » (DESSIN, profile.js) appliqué aussi au dessin vu de dessus (vignettes, vue du dessus)
def rep(a,b):
    global lib
    assert lib.count(a)==1,a[:70]
    lib=lib.replace(a,b)
rep("const col=gray?'#777':(c.state==='caught'&&Math.sin(simT*30)>0?'#ffffff':(c.infest>0&&Math.sin(simT*8)>0.6?'#ff6ad5':c.cLine));",
    "const col=gray?'#777':(c.state==='caught'&&Math.sin(simT*30)>0?'#ffffff':(c.infest>0&&Math.sin(simT*8)>0.6?'#ff6ad5':(NAT()?natLine(c):c.cLine)));")
rep("  // halo pulsé\n  if(!gray){\n    ctx.globalCompositeOperation='lighter';","  // halo pulsé\n  if(!gray&&!NAT()){\n    ctx.globalCompositeOperation='lighter';")
rep("    ctx.strokeStyle=col;ctx.globalAlpha=alpha*bright*(0.12+0.3*P0);ctx.lineWidth=3.2;ctx.stroke();\n    ctx.globalAlpha=alpha*(0.45+0.5*bright);ctx.lineWidth=1;ctx.stroke();\n    for(const l of c.legs){",
    "    ctx.strokeStyle=col;if(!FIN()){ctx.globalAlpha=alpha*bright*(0.12+0.3*P0);ctx.lineWidth=3.2;ctx.stroke()}\n    ctx.globalAlpha=alpha*(0.45+0.5*bright);ctx.lineWidth=FIN()?0.7:1;ctx.stroke();\n    if(!FIN())for(const l of c.legs){")
rep("    if(!gray){ctx.fillStyle=c.segT[i];ctx.globalAlpha=alpha*(0.5+0.5*p);ctx.fill()}\n    ctx.save();ctx.clip();\n    const gx=clamp(Math.round(len/6),1,4)",
    "    if(!gray){if(NAT()){ctx.fillStyle=natFill(c);ctx.globalAlpha=alpha}else{ctx.fillStyle=c.segT[i];ctx.globalAlpha=alpha*(0.5+0.5*p)}ctx.fill()}\n    ctx.save();ctx.clip();\n    const gx=clamp(Math.round(len/6),1,4)")
rep("    if(!gray){ctx.fillStyle=lc;for(let a=0;a<gx;a++)for(let b=0;b<gy;b++){const lit=((a*7+b*3+i*5+c.beats)%4)===0;\n      ctx.globalAlpha=alpha*bright*(lit?",
    "    if(!gray&&!NAT()){ctx.fillStyle=lc;const kf=FIN()?0.4:1;for(let a=0;a<gx;a++)for(let b=0;b<gy;b++){const lit=((a*7+b*3+i*5+c.beats)%4)===0;\n      ctx.globalAlpha=alpha*bright*kf*(lit?")
rep("    ctx.globalAlpha=alpha*0.5;ctx.strokeStyle=lc;ctx.lineWidth=0.6;ctx.beginPath();\n    for(let a=1;a<gx;a++)",
    "    ctx.globalAlpha=alpha*(FIN()?0.25:0.5);ctx.strokeStyle=lc;ctx.lineWidth=FIN()?0.35:0.6;ctx.beginPath();\n    for(let a=1;a<gx;a++)")
rep("    shapePath(sh,len,wid,0,0,1);ctx.strokeStyle=lc;ctx.globalAlpha=alpha*bright*(0.15+0.45*p);ctx.lineWidth=3;ctx.stroke();\n    ctx.globalAlpha=alpha*(0.6+0.4*bright);ctx.lineWidth=1;ctx.stroke();\n    if(!gray&&len*wid>25){",
    "    shapePath(sh,len,wid,0,0,1);ctx.strokeStyle=lc;if(!NAT()){ctx.globalAlpha=alpha*bright*(0.15+0.45*p)*(FIN()?0.5:1);ctx.lineWidth=FIN()?1.6:3;ctx.stroke()}\n    ctx.globalAlpha=alpha*(0.6+0.4*bright);ctx.lineWidth=FIN()?0.6:1;ctx.stroke();\n    if(!gray&&!FIN()&&len*wid>25){")
rep("    if(i===0){ctx.globalAlpha=alpha;ctx.fillStyle=lc;ctx.fillRect(len/2-3,-wid/2+1,2,2);ctx.fillRect(len/2-3,wid/2-3,2,2)}",
    "    if(i===0){ctx.globalAlpha=alpha;if(NAT()&&!gray){ctx.fillStyle='#0a0a0a';for(const sy of [-1,1]){ctx.beginPath();ctx.arc(len/2-2,sy*(wid/2-1.6),0.9,0,TAU);ctx.fill()}}else{ctx.fillStyle=lc;ctx.fillRect(len/2-3,-wid/2+1,2,2);ctx.fillRect(len/2-3,wid/2-3,2,2)}}")
core=open('biome_core.js').read()+'\n'+open('variants.js').read()+'\n'+open('unlocks.js').read()+'\n'+open('decor.js').read()+'\n'+open('topview.js').read()+'\n'+open('profile.js').read()+'\n'+open('devices.js').read()+'\n'+open('links.js').read()+'\n'+open('lure.js').read()+'\n'+open('species2.js').read()+'\n'+open('species3.js').read()
main=open('biome_main.js').read()+'\n'+open('menu.js').read()+'\n'+open('extras.js').read()+"\n"+open('tutorial.js').read()+"\n"+open('ambiance.js').read()+'\n'+open('save.js').read()+'\n'+open('bascule.js').read()+'\n'+open('tiroir.js').read()+'\n'+open('soie.js').read()+'\n'+open('instincts.js').read()+'\n'+open('decor_top.js').read()+'\n'+open('aide.js').read()+'\n'+open('ctrl.js').read()+'\n'+open('defis.js').read()+'\n'+open('langue.js').read()+'\n'+open('fixes.js').read()+"\n"
# fichiers ajoutés après fixes.js (modes de jeu, bêtes, milieu, salle, confort, savoir)
for f in ['progres.js','vie.js','vegetal.js','milieu.js','salle2.js','confort.js','savoir.js','soins.js','aqua.js','jardin2.js','famille.js','grand.js','histoire.js','anatomie.js','anatomie2.js','anatomie3.js','dessus.js','physique.js','phryne.js','contact.js']:
    main+=open(f).read()+'\n'
main=main.replace("for(const id of order)for(const c of creatures)if(c.sp.id===id)drawCreature(c,1,false);",
 "for(const id of order)for(const c of creatures)if(c.sp.id===id){drawProfile(c,1,false);if(c.load){const h=c.segs[0];ctx.fillStyle=c.load.type==='grain'?(c.load.t===1?'#8a6a3a':'#d8b060'):'#ffb43a';ctx.fillRect(h.x+Math.cos(h.a)*5-1.5,h.y+Math.sin(h.a)*5-1.5,3,3)}}")
html=r'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Vivariom</title>
<style>
html,body{margin:0;height:100%;background:#000;overflow:hidden;color:#ddd;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;touch-action:none;-webkit-user-select:none;user-select:none}
canvas#c{display:block;position:fixed;inset:0}
#hud{position:fixed;top:0;left:0;right:0;padding:6px 10px;font:11px ui-monospace,Menlo,Consolas,monospace;pointer-events:none;z-index:2;background:linear-gradient(#000f 80%,#0000)}
#hud .row{display:flex;flex-wrap:wrap;gap:3px 10px;align-items:center;margin-bottom:3px}
.bar{display:inline-block;width:70px;height:6px;background:#222;border-radius:3px;overflow:hidden}.bar i{display:block;height:100%;background:#8bff6a}
.ok{color:#8bff6a}.ko{color:#ff6a7a}.dim{color:#666}

#tcv{position:fixed;inset:0;pointer-events:none;opacity:.6}
#title{background:radial-gradient(ellipse at 50% 30%,#132016 0%,#050806 60%,#000 100%);align-items:stretch}
.tbox{position:relative;z-index:1;max-width:380px;width:100%;min-height:100%;margin:0 auto;text-align:center;display:flex;flex-direction:column;gap:20px}.ttop{padding-top:6px}.tbtns{margin:auto 0;padding-bottom:40px}
.tlogo{font:700 44px Georgia,serif;letter-spacing:6px;color:#e8ffd8;text-shadow:0 0 18px #8bff6a66;margin:10px 0 4px}.tlogo small{display:block;font:italic 500 14px Georgia,serif;letter-spacing:0.3px;color:#a8d89a;margin-top:6px;text-shadow:none}
.tbugs{font-size:18px;letter-spacing:2px;margin:14px 0 22px;opacity:.85}
.tbtn{display:block;width:100%;margin:10px 0;padding:14px 16px;text-align:center;background:#0b120cdd;border:1px solid #2d4a2f;border-radius:14px;color:#eaffdf;font:700 17px -apple-system,Roboto,sans-serif}
.tbtn small{display:block;font:500 12px -apple-system,Roboto,sans-serif;color:#9bb59a;margin-top:3px}.tbtn.alt{background:#111;border-color:#333;font-size:14px;text-align:center}
.box.wide{max-width:560px}.mhead{display:flex;align-items:center;gap:10px;margin-bottom:8px}.mhead h1{margin:0;flex:1}
.back{background:#111;border:1px solid #444;color:#ddd;border-radius:10px;padding:7px 10px;font:600 13px -apple-system,Roboto,sans-serif}
.chap{border:1px solid #2a2a2a;border-radius:14px;padding:12px;margin:12px 0;background:#0a0a0a}.chap.lock{opacity:.45}.chap.soon{opacity:.6;border-style:dashed}
.ch{display:flex;gap:10px;align-items:center}.ci{font-size:30px}.ch small{display:block;color:#888}.chap p{margin:8px 0;color:#bbb;font-size:13px}
.cbar{height:5px;background:#222;border-radius:3px;overflow:hidden;margin-bottom:8px}.cbar i{display:block;height:100%;background:#8bff6a}
.lvs{display:grid;grid-template-columns:1fr;gap:6px}
#room{position:fixed;inset:0;z-index:6;background:#000;display:none}
.rhead{display:flex;align-items:center;gap:10px;padding:8px 10px;height:40px;background:#0a0a0a;border-bottom:1px solid #222}.rhead b{font-size:16px}.rhead #rcount{flex:1}
#radd{background:#ffe94d;color:#000;border:0;border-radius:10px;padding:8px 12px;font:700 13px -apple-system,Roboto,sans-serif}#radd:disabled{opacity:.35}
#rscroll{position:absolute;top:56px;left:0;right:0;bottom:0;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-x}
#roomin{position:relative;width:max(1180px,100vw)}
#rhint{position:fixed;left:10px;right:10px;bottom:10px;font-size:12px;color:#ccc;background:#000a;padding:6px 10px;border-radius:8px;pointer-events:none}
.wall{position:absolute;left:0;right:0;top:0;background:linear-gradient(#2b2722,#3a342c 70%,#2e2923)}
.floor{position:absolute;left:0;right:0;bottom:0;background:repeating-linear-gradient(90deg,#4a321e 0 118px,#3c2816 118px 120px),linear-gradient(#5a3d24,#2a1a0e)}
.plinth{position:absolute;left:0;right:0;height:8px;background:#1c1712}
.win{position:absolute;width:150px;border:8px solid #d9d2c3;background:linear-gradient(160deg,#9cc8ff,#dff0ff 60%,#b8d8ff);box-shadow:0 0 40px #cfe6ff55}
.meuble{position:absolute;background:linear-gradient(#7a5532,#5a3c22);border-radius:4px;box-shadow:0 10px 18px #0008}.meuble::after{content:'';position:absolute;left:8px;right:8px;top:18px;bottom:10px;border:1px solid #3a2614;border-radius:3px}
.shelf{position:absolute;height:10px;background:linear-gradient(#8a6440,#5a3c22);box-shadow:0 6px 10px #0007}.brk{position:absolute;width:6px;height:26px;background:#222}
.potp,.lampp{position:absolute;font-size:56px}.lampp{font-size:64px}
.viv{position:absolute;width:150px;height:128px;touch-action:none;cursor:grab;filter:drop-shadow(0 8px 8px #000a)}.viv.drag{filter:drop-shadow(0 18px 14px #000c);z-index:5;transform:scale(1.04)}
.vglass{position:relative;height:96px;border:3px solid #1a1d22;border-radius:3px;background:#05070a;overflow:hidden}.vglass img{width:100%;height:100%;object-fit:cover;display:block}
.vglass::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,#fff2 0 18%,#fff0 30%,#fff1 34%,#fff0 44%)}
.vlid{position:absolute;left:0;right:0;top:0;height:5px;background:repeating-linear-gradient(90deg,#333 0 2px,#111 2px 4px)}
.vempty{color:#555;text-align:center;padding-top:36px;font-size:12px}
.vname{font:700 12px -apple-system,Roboto,sans-serif;color:#eee;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:24px}.vic{font-size:10px;color:#bbb;white-space:nowrap;overflow:hidden}
.vmore{position:absolute;right:0;bottom:12px;background:#111;border:1px solid #444;color:#ddd;border-radius:8px;width:24px;height:22px;font-size:13px;padding:0}

.rhead b{flex:1;font-size:15px;white-space:nowrap}
.floorw{position:absolute;left:0;right:0;bottom:0;overflow:hidden;background:linear-gradient(#5a3d24,#2a1a0e)}
.floorp{position:absolute;left:-200px;right:-200px;top:0;height:900px;transform:perspective(420px) rotateX(58deg);transform-origin:top;opacity:.9}
.rpost{position:absolute;width:8px;background:linear-gradient(90deg,#0c0c0c,#6a6e74 45%,#1a1a1a);border-radius:2px}
.rlvl{position:absolute;height:8px;background:linear-gradient(#9a9ea4,#45484c);border-radius:2px;box-shadow:0 5px 8px #0008}
.rshadow{position:absolute;background:#0003;filter:blur(6px)}
.slotfree{position:absolute;border:1px dashed #ffffff22;border-radius:4px}
.rv{position:absolute;touch-action:pan-x}.rv .viv{position:relative;width:100%;height:100%}.rv.drag{z-index:9;filter:drop-shadow(0 16px 14px #000c);transform:scale(1.06)}
.viv{position:relative;border:3px solid #15181c;border-radius:4px;background:#05070a;overflow:hidden;box-shadow:0 6px 10px #0009}
.viv img{width:100%;height:100%;object-fit:cover;display:block}.viv::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,#fff2 0 15%,#fff0 28%,#fff1 32%,#fff0 40%)}
.viv.sel{outline:2px solid #ffe94d;outline-offset:3px}
.vtag{position:absolute;left:0;right:0;bottom:0;font:600 10px -apple-system,Roboto,sans-serif;color:#eee;background:#000a;padding:1px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rlist{display:none;position:absolute;top:56px;left:0;right:0;bottom:0;overflow-y:auto;background:linear-gradient(#26211c,#1a1612);padding:10px;box-sizing:border-box;touch-action:pan-y}
.lgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px 12px}
.lcard .viv{height:96px}.lcard .nm{font:700 13px -apple-system,Roboto,sans-serif;margin-top:5px}.lcard .st{font-size:11px;color:#9c9}.lcard .st.warn{color:#fb6}
.lcard{padding-bottom:12px;border-bottom:8px solid #6a4a2c;border-radius:0 0 3px 3px}
.addb{height:96px;border:2px dashed #666;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:13px}.lock .addb{opacity:.35}
#rdim{display:none;position:absolute;inset:56px 0 0;background:#0007}
#rsheet{position:absolute;left:0;right:0;bottom:0;height:auto;max-height:86%;overflow-y:auto;overscroll-behavior:contain;background:#0b0b0bf7;border-top:1px solid #555;border-radius:22px 22px 0 0;transform:translateY(105%);transition:transform .28s ease;z-index:7;padding-bottom:0;touch-action:pan-y}
#rsheet .cbtns{position:sticky;bottom:0;background:#0b0b0bf7;padding:6px 0 10px;margin:0 -16px;padding-left:16px;padding-right:16px;z-index:3}
#rsheet.open{transform:none}
.sclose{position:absolute;right:10px;top:8px;background:#111;border:1px solid #444;color:#ddd;border-radius:50%;width:30px;height:30px;z-index:2}
.grab{width:42px;height:4px;background:#555;border-radius:2px;margin:9px auto 6px}
.car{position:relative;height:160px}.cbig{position:absolute;left:56px;right:56px;top:4px;height:150px}.cbig .viv{height:100%}
.cgh{position:absolute;top:30px;width:90px;height:110px;opacity:.35}.cgh .viv{height:100%}.cgh.l{left:-40px}.cgh.r{right:-40px}
.cdots{text-align:center;margin:8px 0}.cdots i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#555;margin:0 4px}.cdots i.on{background:#ffe94d}
.cinfo{padding:0 16px}.cname{display:flex;align-items:center;gap:8px;margin-bottom:6px}.cname input{flex:1;background:transparent;border:0;border-bottom:1px dashed #555;color:#fff;font:700 17px -apple-system,Roboto,sans-serif;padding:3px 0}
.tag{font-size:11px;color:#bbb}.warnt{color:#fb6}
.bar2{height:7px;background:#222;border-radius:4px;overflow:hidden;margin:4px 0 9px}.bar2 i{display:block;height:100%}
.cbtns{display:flex;gap:8px}.cbtns .btn{flex:1;margin-top:8px}.cbtns .btn2{width:auto;padding:10px 14px;margin-top:8px}
#vnav{display:none;position:fixed;left:8px;top:108px;z-index:3;gap:6px}
#vnav button{background:#0b0b0bee;border:1px solid #444;color:#ddd;border-radius:10px;padding:7px 10px;font:600 12px -apple-system,Roboto,sans-serif}#vnav #vnsalle{background:#ffe94d;color:#000;border:0}
#vstrip{display:none;position:fixed;left:0;right:0;top:146px;z-index:3;gap:8px;padding:8px;background:#0b0b0bee;border-bottom:1px solid #333;overflow-x:auto;align-items:center}
#vstrip .sv{flex:none;width:86px;height:60px}#vstrip .sv .viv{height:100%}#vstrip .sv.on .viv{outline:2px solid #ffe94d}

#vsheet,#opts,#stylep,#lic,#journal,#achp,#couvep{z-index:8}
#drawer .dhead{position:sticky;top:-8px;background:#0b0b0b;z-index:2;padding:6px 0;margin-top:-6px}
#fiches{background:#000}
@media (max-height:520px){#zoomui{flex-direction:row;bottom:auto;top:108px;right:8px}#zoomui button{width:34px;height:34px}}
.jlist{max-height:70vh;overflow:auto}.jrow{display:flex;gap:8px;padding:5px 0;border-bottom:1px solid #1a1a1a;font-size:13px}.jt{color:#777;font:11px ui-monospace,monospace;flex:none;width:40px}.ji{flex:none;width:20px;text-align:center}
.agrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.acard{border:1px solid #2a2a2a;border-radius:10px;padding:8px;opacity:.45;background:#0a0a0a}.acard.got{opacity:1;border-color:#ffe94d66;background:#15130a}.acard span{font-size:24px;display:block}.acard b{display:block;font-size:13px}.acard small{color:#aaa;font-size:11px}
.crow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;font-size:13px}.crow .bar2{flex:1;max-width:140px}#couvep h3{margin:12px 0 4px;color:#8bff6a;font-size:13px}
#toast{position:fixed;left:50%;top:120px;transform:translate(-50%,-30px);z-index:20;background:#15130aee;border:1px solid #ffe94d;color:#fff;padding:10px 16px;border-radius:14px;font-size:14px;text-align:center;opacity:0;pointer-events:none;max-width:86%}
#toast.show{animation:toast 4s ease}@keyframes toast{0%{opacity:0;transform:translate(-50%,-30px)}10%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-10px)}}
.stars{text-align:center;font-size:34px;color:#ffe94d;letter-spacing:6px;margin-top:10px}.stars span{color:#333}
.tubes{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0 2px}.tubes .back{padding:4px 8px;font-size:11px}.tubes .back.on{background:#bfe6ff;color:#000;border-color:#bfe6ff}
.tubesvg{position:absolute;pointer-events:none;z-index:4}#lic{z-index:9}
#opts h3{margin:14px 0 4px;font-size:13px;color:#8bff6a;text-transform:uppercase;letter-spacing:1px}
.orow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #1c1c1c;font-size:13px}.orow input[type=range]{width:130px}
.oseg{display:flex;border:1px solid #444;border-radius:9px;overflow:hidden;flex:none}.oseg button{background:#111;border:0;border-right:1px solid #333;color:#bbb;padding:6px 9px;font:600 12px -apple-system,Roboto,sans-serif}.oseg button:last-child{border-right:0}.oseg button.on{background:#ffe94d;color:#000}
#lic p{font-size:13px;color:#ccc}
.srow{margin:12px 0}.srow>span{display:block;font-weight:700;margin-bottom:6px}.sw{display:flex;flex-wrap:wrap;gap:6px}
.sw button{display:flex;flex-direction:column;align-items:center;gap:4px;width:74px;padding:6px 4px;background:#111;border:1px solid #333;border-radius:10px;color:#ccc;font:600 11px -apple-system,Roboto,sans-serif}
.sw button i{display:block;width:56px;height:30px;border-radius:6px;border:1px solid #0006}.sw button.on{border-color:#ffe94d;color:#ffe94d}
.rv .viv,.lcard .viv,#vstrip .viv,.cbig .viv,.cgh .viv{border-color:var(--frame,#15181c)}
.reward{display:flex;gap:12px;align-items:center;margin-top:12px;padding:12px;border:1px solid #ffe94d66;border-radius:12px;background:#1a1706}.reward span{font-size:34px}.reward small{display:block;color:#ccc;margin-top:2px}
.newit{background:#13200f;border:1px solid #8bff6a55;border-radius:10px;padding:8px 10px}
.rew{display:block;font-size:11px;color:#c9b45a;margin-top:3px}.rew.got{color:#8bff6a}
#vsname{width:100%;box-sizing:border-box;padding:10px;background:#111;border:1px solid #444;border-radius:10px;color:#fff;font-size:15px}

#viewsw{position:fixed;right:8px;top:70px;z-index:3;display:flex;background:#0b0b0bee;border:1px solid #444;border-radius:12px;overflow:hidden}
#viewsw button{background:none;border:0;border-right:1px solid #333;color:#bbb;font:600 12px -apple-system,Roboto,sans-serif;padding:7px 10px}
#viewsw button:last-child{border-right:0}
#viewsw button.on{background:#ffe94d;color:#000}
#bback{display:none!important;position:fixed;right:10px;top:80px;z-index:3;background:#0b0b0bee;border:1px solid #ffe94d;color:#ffe94d;border-radius:12px;padding:8px 12px;font:600 13px -apple-system,Roboto,sans-serif}
#zoomui{position:fixed;right:8px;bottom:142px;z-index:3;display:flex;flex-direction:column;gap:6px}
#zoomui button.on{border-color:#ffe94d;box-shadow:0 0 8px #ffe94d66}
#legend{display:none;position:fixed;left:8px;right:56px;top:96px;z-index:3;flex-wrap:wrap;gap:3px 10px;font:600 10px -apple-system,Roboto,sans-serif;color:#ddd;background:#000b;padding:5px 8px;border-radius:8px;pointer-events:none}
#legend span{display:flex;align-items:center;gap:4px}#legend i{display:inline-block;width:14px;height:3px;border-radius:2px}
#zoomui button{width:38px;height:38px;border-radius:10px;background:#0b0b0bdd;border:1px solid #444;color:#ddd;font:600 18px -apple-system,Roboto,sans-serif}
#devp{position:fixed;inset:0;z-index:6;display:none;align-items:flex-end;justify-content:center;background:#0006;padding:12px}
#devp .dbox{width:100%;max-width:440px;background:#070707;border:1px solid #444;border-radius:14px;padding:14px 16px;font-size:13px;line-height:1.45;color:#ccc}
#devp h2{font:600 18px Georgia,serif;margin:0 0 4px;color:#eee}#devp p{margin:4px 0 8px;color:#999}
.drow{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:8px 0}.drow input[type=range]{flex:1;max-width:55%;accent-color:#ffe94d}.drow input[type=checkbox]{width:22px;height:22px;accent-color:#ffe94d}
.seg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.seg button{background:#111;border:1px solid #444;color:#bbb;border-radius:8px;padding:5px 8px;font-size:12px}.seg button.on{border-color:var(--c);color:var(--c);box-shadow:0 0 8px var(--c)}
.lvl{display:inline-block;width:50%;height:8px;background:#222;border-radius:4px;overflow:hidden}.lvl i{display:block;height:100%;background:#4a9cff}
#pal{position:fixed;left:0;right:0;bottom:62px;display:flex;gap:4px;padding:4px 6px;z-index:2;background:linear-gradient(#0000,#000d 40%);align-items:stretch}
#pal .sep{flex:none;width:3px}
#pal .chip,#pal .cat,#pal .ghostc{flex:1 1 0!important;min-width:0;width:auto!important}#pal .chip canvas{width:100%!important}#pal .chip.hand .big{font-size:20px}.ghostc{border:1px dashed #222;border-radius:9px}#pal .nm{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cat{position:relative;background:#101410;border:1px solid #2d4a2f;border-radius:9px;padding:2px 2px 3px;text-align:center;font:700 9px -apple-system,Roboto,sans-serif;color:#cfe;line-height:1.15}
.cat .big{display:block;font-size:20px;height:34px;line-height:34px}.cat .cnt{position:absolute;top:1px;right:4px;font:600 9px ui-monospace,monospace;color:#8bff6a}.cat.open{border-color:#8bff6a;background:#173018}
#drawer{display:none;position:fixed;left:6px;right:6px;bottom:128px;z-index:4;background:#0b0b0bf5;border:1px solid #444;border-radius:16px;padding:8px 8px 10px;max-height:46vh;overflow-y:auto;touch-action:pan-y;box-shadow:0 -10px 30px #000a}
.dhead{display:flex;align-items:center;gap:8px;margin:0 2px 8px}.dhead .dim{flex:1;font-size:11px}.dx{background:#111;border:1px solid #444;color:#ddd;border-radius:50%;width:28px;height:28px}
.dgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
#drawer .chip{position:relative;background:#070707;border:1px solid #2a2a2a;border-radius:9px;padding:2px 2px 3px;text-align:center;font:600 9px -apple-system,Roboto,sans-serif;color:#aaa;line-height:1.15}
#drawer .chip canvas{width:100%;height:36px;display:block;margin:0 auto 1px}#drawer .chip .big{display:block;font-size:22px;height:36px;line-height:36px}
#drawer .chip .st{position:absolute;top:1px;right:4px;font:600 9px ui-monospace,monospace;color:#ffe94d}#drawer .chip.on{border-color:#ffe94d;color:#ffe94d}#drawer .chip.empty{opacity:.35}
#pal::-webkit-scrollbar{display:none}
#pal .chip{flex:none;width:58px;position:relative;background:#070707;border:1px solid #2a2a2a;border-radius:9px;padding:2px 2px 3px;text-align:center;font:600 9px -apple-system,Roboto,sans-serif;color:#aaa;line-height:1.15}
#pal .chip canvas{width:52px;height:34px;display:block;margin:0 auto 1px}
#pal .chip .big{display:block;font-size:22px;height:34px;line-height:34px}
#pal .chip .st{position:absolute;top:1px;right:4px;font:600 9px ui-monospace,monospace;color:#ffe94d}
#pal .chip.on{border-color:#ffe94d;color:#ffe94d;box-shadow:0 0 8px #ffe94d44}
#pal .chip.empty{opacity:.35}
#bar{position:fixed;left:6px;right:6px;bottom:10px;display:flex;gap:5px;justify-content:center;z-index:2}
#bar button{flex:1;min-width:0;max-width:96px;background:#0b0b0bdd;border:1px solid #333;color:#bbb;border-radius:12px;padding:6px 2px 5px;font:600 11px -apple-system,Roboto,sans-serif;line-height:1.25;white-space:nowrap;overflow:hidden}
#bar button small{display:block;font-weight:400;font-size:9px;color:#777}
.ov{position:fixed;inset:0;background:#000e;z-index:5;display:none;overflow:auto;touch-action:pan-y;align-items:flex-start;justify-content:center;padding:18px;box-sizing:border-box}
.box{max-width:470px;width:100%;border:1px solid #333;padding:18px;background:#050505;font-size:14px;line-height:1.5;margin:auto}
.box h1{font:600 21px Georgia,serif;margin:0 0 6px}
.box p{color:#bbb;margin:6px 0}
.btn{margin-top:10px;width:100%;padding:11px;background:#ffe94d;color:#000;border:0;border-radius:10px;font:700 15px -apple-system,Roboto,sans-serif}
.btn2{margin-top:8px;width:100%;padding:10px;background:#111;color:#ddd;border:1px solid #444;border-radius:10px;font:600 14px -apple-system,Roboto,sans-serif}
#levels{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.lv{position:relative;text-align:left;background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:8px;color:#ddd;font-size:12px}
.lv b{font:600 20px Georgia,serif;color:#ffe94d;margin-right:6px}.lv span{font-weight:600}.lv small{display:block;margin-top:4px;font-size:13px}
.lv em{position:absolute;top:6px;right:8px;color:#8bff6a;font-style:normal}
.resume{display:flex;align-items:center;gap:12px;width:100%;margin:6px 0 10px;padding:12px 14px;text-align:left;background:#15130a;border:1px solid #ffe94d;border-radius:14px;color:#fff;font:600 14px -apple-system,Roboto,sans-serif;box-shadow:0 0 16px #ffe94d22}
.resume .rplay{flex:none;width:34px;height:34px;border-radius:50%;background:#ffe94d;color:#000;display:flex;align-items:center;justify-content:center;font-size:15px}
.resume b{display:block;line-height:1.25}.resume small{display:block;color:#bba;font-weight:500;font-size:11px;margin-top:3px}
.tlink{display:block;margin:4px auto 0;background:none;border:0;color:#9bb59a;font:500 13px -apple-system,Roboto,sans-serif;text-decoration:underline;padding:8px}
#tuto{position:fixed;inset:0;z-index:30;pointer-events:none;display:none}
#tuto .thalo{position:fixed;border:2px solid #ffe94d;border-radius:12px;box-shadow:0 0 0 9999px #0007,0 0 18px #ffe94daa;transition:all .25s ease;pointer-events:none;animation:tpulse 1.2s ease-in-out infinite}
#tuto .thalo.free{box-shadow:0 0 18px #ffe94daa}
@keyframes tpulse{50%{border-color:#fff6b0}}
#tuto .tarrow{position:fixed;width:0;height:0;border:12px solid transparent;transition:all .25s ease;pointer-events:none;filter:drop-shadow(0 0 4px #ffe94d)}
#tuto .tarrow.dn{border-top:16px solid #ffe94d;border-bottom:0;animation:tbobd .8s ease-in-out infinite alternate}
#tuto .tarrow.up{border-bottom:16px solid #ffe94d;border-top:0;animation:tbobu .8s ease-in-out infinite alternate}
@keyframes tbobd{to{transform:translateY(-6px)}}@keyframes tbobu{to{transform:translateY(6px)}}
#tuto .tbub{position:fixed;left:12px;right:12px;max-width:380px;margin:0 auto;background:#0b0b0bf7;border:1px solid #ffe94d;border-radius:16px;padding:12px 14px 10px;color:#eee;font:14px/1.4 -apple-system,Roboto,sans-serif;pointer-events:auto;box-shadow:0 10px 30px #000c;transition:top .25s ease}
#tuto .tbub h3{margin:0 0 4px;color:#ffe94d;font-size:15px}#tuto .tbub p{margin:0 0 8px}#tuto .tbub .tdo{color:#8bff6a;font-weight:600}
#tuto .tbtns2{display:flex;align-items:center;gap:8px}#tuto .tstep{flex:1;color:#777;font-size:12px}
#tuto .tskip{background:none;border:0;color:#999;text-decoration:underline;font:500 12px -apple-system,Roboto,sans-serif;padding:6px 4px}
#tuto .tnext{background:#ffe94d;color:#000;border:0;border-radius:10px;padding:8px 14px;font:700 13px -apple-system,Roboto,sans-serif}
.lv.lock{opacity:.3}
#fiches{display:none;padding:0 10px 30px}
#fiches header{position:sticky;top:0;background:#000;padding:12px 4px 8px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;z-index:1}
#fiches header h1{font:600 20px Georgia,serif;margin:0}
#fiches header button{background:none;border:1px solid #444;color:#ccc;border-radius:8px;padding:4px 12px;font-size:14px}
#fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin-top:10px}
.card{border:1px solid #262626;background:#060606;border-radius:8px;padding:10px;font-size:12.5px;line-height:1.45}
.card canvas{width:100%;height:84px;display:block;margin-bottom:6px;border-bottom:1px solid #1a1a1a}
.card b{font:600 16px Georgia,serif;color:#eee}
.card .badge{display:inline-block;margin-left:6px;font-size:10px;border:1px solid #555;border-radius:8px;padding:0 6px;color:#aaa;vertical-align:middle}
.card p{margin:5px 0;color:#a5a5a5}.card u{text-decoration:none;color:#ffe94d;font-weight:600;margin-right:4px}
/* Paysage sur téléphone (classe land posée par resize) : outils à gauche, vues et zoom à droite ; inversé en mode gaucher */
body.land #hud{padding-left:8px}
body.land #pal{display:grid!important;grid-template-columns:1fr 1fr;gap:5px!important;left:0!important;right:auto!important;width:170px!important;top:48px!important;bottom:auto!important;padding:4px 6px!important;background:none!important;box-sizing:border-box}
body.land #pal .sep{display:none!important}body.land #pal .chip,body.land #pal .cat,body.land #pal .ghostc{min-height:50px}
body.land #bar{left:6px!important;right:auto!important;bottom:8px!important;width:164px!important;gap:3px!important;justify-content:space-between!important}
body.land #bar button{padding:7px 0!important;font-size:0!important;flex:1!important}body.land #bar button small{display:none!important}body.land #bar button::first-letter{font-size:17px}
body.land #bar #spd{font-size:13px!important}body.land #bar #spd::first-letter{font-size:inherit}
body.land #viewsw{top:48px!important;right:6px!important;left:auto!important;flex-direction:column!important;width:50px}body.land #viewsw button{font-size:0!important;padding:8px 0!important}body.land #viewsw button::first-letter{font-size:17px}
body.land #zoomui{top:auto!important;left:auto!important;right:6px!important;bottom:8px!important;flex-direction:column!important}
body.land #drawer{left:180px!important;right:62px!important;bottom:8px!important;top:48px;max-height:none!important}
body.land #legend{left:184px;right:66px;top:52px}body.land #toast{top:52px}
body.land #vnav{left:184px;top:52px}body.land #vstrip{left:178px;right:60px;top:92px}
body.land.left #pal{left:auto!important;right:0!important}body.land.left #bar{left:auto!important;right:6px!important}
body.land.left #viewsw{right:auto!important;left:6px!important}body.land.left #zoomui{right:auto!important;left:6px!important}
body.land.left #drawer{left:62px!important;right:180px!important}body.land.left #legend{left:66px;right:184px}
body.land.left #vnav{left:auto;right:184px}body.land.left #vstrip{left:60px;right:178px}
/* Survol à la souris (ordinateur seulement : pas d'effet collant au doigt sur téléphone) */
@media (hover:hover) and (pointer:fine){button,.lv,.cat,.chip,.ghostc{transition:box-shadow .12s,outline-color .12s}button:not(:disabled),.lv,.cat,.chip{cursor:pointer}button:not(:disabled):hover,.lv:hover,.cat:hover,.chip:hover{box-shadow:inset 0 0 0 100vmax #ffffff1c;outline:1px solid #ffe94dbb;outline-offset:-1px}.btn:not(:disabled):hover{box-shadow:inset 0 0 0 100vmax #ffffff40;outline:none}button:disabled:hover,.lv.lock:hover{cursor:default}.lv.lock:hover{box-shadow:none;outline:none}}
/* Appui (souris ou doigt) : le bouton s'éclaire pendant qu'on appuie */
button:not(:disabled):active,.lv:not(.lock):active,.cat:active,.chip:active{box-shadow:inset 0 0 0 100vmax #ffffff30!important;outline:1px solid #ffe94d!important;outline-offset:-1px}
.btn:not(:disabled):active{box-shadow:inset 0 0 0 100vmax #00000030!important}
/* Grande salle : ＋ sur les emplacements libres, étagère à ajouter en pointillé, cible du glisser-déposer */
#radd{display:none!important}
.rv{user-select:none;-webkit-user-select:none}.rv img{-webkit-user-drag:none;user-drag:none;pointer-events:none}.rv.drag{z-index:5}
.slotfree{background:#ffffff06;border:1px dashed #ffffff40;border-radius:4px;color:#ffffff70;font:300 24px -apple-system,Roboto,sans-serif;padding:0;display:flex;align-items:center;justify-content:center}
.raddr{position:absolute;background:#ffffff05;border:2px dashed #ffffff40;border-radius:8px;color:#ffffff80;font:300 34px -apple-system,Roboto,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0}.raddr small{font:600 12px -apple-system,Roboto,sans-serif;letter-spacing:.5px}
.rdel{position:absolute;width:28px;height:28px;border-radius:50%;background:#111;border:1px solid #555;color:#ccc;font-size:13px;padding:0;z-index:3}
.rtgt{position:absolute;border:2px solid #ffe94d;border-radius:5px;box-shadow:0 0 14px #ffe94d66;pointer-events:none;z-index:4}
/* Grands écrans : les panneaux du bas ne s'étirent plus sur toute la largeur */
#rsheet{left:50%!important;right:auto!important;width:min(100%,640px);transform:translate(-50%,105%)!important;border-left:1px solid #555;border-right:1px solid #555;box-sizing:border-box}#rsheet.open{transform:translate(-50%,0)!important}
@media (min-width:900px){body:not(.land) #pal{left:50%!important;right:auto!important;width:min(100%,860px);transform:translateX(-50%);box-sizing:border-box}body:not(.land) #drawer{left:50%!important;right:auto!important;width:min(calc(100% - 12px),860px);transform:translateX(-50%);box-sizing:border-box}}
/* Fiche du bac : vivarium choisi centré, voisins (précédent/suivant) juste à côté, en transparence */
#rsheet .cbig{left:calc(50% - 90px);right:auto;top:10px}
#rsheet .cgh{top:56px}#rsheet .cgh.l{left:calc(50% - 234px)}#rsheet .cgh.r{right:auto;left:calc(50% + 114px)}
/* Tiroir Bêtes : case par espèce, bouton ▾ des variantes, liste déroulante */
.gcell{position:relative;display:flex}.gcell>.chip{flex:1;min-width:0}
#drawer .chip .vn{display:block;font:500 9px/16px -apple-system,Roboto,sans-serif;height:16px;margin-top:2px;color:#8a9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#drawer .gcell .chip canvas{height:40px}
/* bouton des variantes : sur la dernière ligne de la case (la ligne du nom de variante), pour ne pas cacher le dessin */
.vbtn{position:absolute;left:4px;right:4px;bottom:3px;height:16px;background:#1c2a1c;border:1px solid #3d6b3f;color:#bfeaa8;border-radius:8px;font:600 9.5px/14px -apple-system,Roboto,sans-serif;padding:0 4px;z-index:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gcell .chip.grp .vn{visibility:hidden}@media (max-width:600px){.vlong{display:none}}
.vmenu{position:absolute;z-index:5;background:#0d100d;border:1px solid #8bff6a88;border-radius:12px;padding:6px;box-shadow:0 10px 30px #000c;display:flex;flex-direction:column;gap:4px}
.vmh{display:flex;justify-content:space-between;align-items:center;font:700 12px -apple-system,Roboto,sans-serif;color:#cfe;padding:2px 4px 4px}.vx{background:#111;border:1px solid #444;color:#ccc;border-radius:50%;width:24px;height:24px;padding:0;font-size:11px}
.vrow{position:relative;display:flex;align-items:center;gap:8px;background:#070707;border:1px solid #2a2a2a;border-radius:9px;padding:4px 6px;text-align:left;color:#ddd}
.vrow.on{border-color:#ffe94d;color:#ffe94d}.vrow canvas{width:46px;height:30px;flex:none}.vrow b{font:600 12px -apple-system,Roboto,sans-serif}.vrow i{font:500 10px -apple-system,Roboto,sans-serif;color:#8a9}
.vrow small{display:block;font:italic 10px Georgia,serif;color:#888}.vrow .st{position:absolute;top:3px;right:6px;font:600 9px ui-monospace,monospace;color:#ffe94d}
/* Fiche d'aide du bac à sable : nourriture, prédateurs, besoins de la bête en main */
#aide{display:none;position:fixed;left:8px;right:8px;bottom:134px;z-index:3;background:#0b0e0bf2;border:1px solid #3d6b3f;border-radius:12px;padding:7px 9px;font:12px/1.35 -apple-system,Roboto,sans-serif;color:#ddd;box-shadow:0 6px 20px #000a}
#aide .ahead{display:flex;align-items:center;gap:8px;margin-bottom:4px}#aide .ahead b{font-size:13px;color:#fff;white-space:nowrap}
#aide .abilan{flex:1;min-width:0;font-size:11px;color:#8bff6a}#aide .abilan.warn{color:#ffb35c}
#aide .ax{background:#111;border:1px solid #444;color:#ccc;border-radius:50%;width:24px;height:24px;padding:0;font-size:11px;flex:none}
#aide .arow{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-top:3px}#aide .alab{flex:none;width:66px;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#8a9}
#aide .apill{border-radius:20px;padding:2px 8px;font-size:11px;border:1px solid #333;background:#111;white-space:nowrap}#aide .apill b{margin-left:3px}
#aide .apill.ok{border-color:#3d6b3f;color:#bfeaa8}#aide .apill.manque{border-color:#5a3a2a;color:#d9a07a;opacity:.85}#aide .apill.danger{border-color:#7a2a2a;color:#ff9a8a;background:#1c0d0d}#aide .apill.calme{color:#999}
#aide .atxt{flex:1;min-width:160px;font-size:11px;color:#bbb}
@media (min-width:900px){body:not(.land) #aide{left:50%;right:auto;width:min(calc(100% - 16px),640px);transform:translateX(-50%)}}
body.land #aide{left:184px;right:66px;bottom:auto;top:50px}body.land.left #aide{left:66px;right:184px}
/* Panneau de contrôle du matériel (ctrl.js) */
#ctrl{display:none;position:fixed;right:8px;top:48px;bottom:8px;width:300px;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;z-index:3;background:#0b0e0bf4;border:1px solid #2d4a2f;border-radius:14px;padding:6px 12px 10px;font-size:12px;line-height:1.4;color:#ccc}
#ctrl.sheet{left:6px;right:6px;top:auto;bottom:6px;width:auto;max-height:62vh;z-index:6;box-shadow:0 -10px 30px #000c}
#ctrl .chead{position:sticky;top:-6px;background:#0b0e0b;display:flex;align-items:center;gap:8px;padding:6px 0;z-index:1}#ctrl .chead b{font-size:14px;color:#fff}#ctrl .chead .dim{flex:1;font-size:11px}
#ctrl .cx{background:#111;border:1px solid #444;color:#ccc;border-radius:50%;width:26px;height:26px;padding:0}
#ctrl .cs{border-top:1px solid #1f2a1f;padding:6px 0 2px}#ctrl h3{display:flex;align-items:center;gap:6px;margin:2px 0;font:600 13px -apple-system,Roboto,sans-serif;color:#e8eee4}
#ctrl .cst{margin-left:auto;font:600 11px ui-monospace,monospace;color:#8bff6a}#ctrl p{margin:3px 0 6px;color:#8a948a;font-size:11px}#ctrl .drow{margin:5px 0}#ctrl .btn{padding:8px;font-size:13px;margin-top:4px}
#ctrl svg{max-width:100%;height:auto}
body.ctrlw #viewsw,body.ctrlw #zoomui{right:318px!important}body.ctrlw #aide{right:318px}
body.ctrlw #pal,body.ctrlw #drawer{left:8px!important;right:318px!important;width:auto!important;transform:none!important}body.ctrlw #bar{right:318px!important}body.ctrlw #aide{left:8px;right:318px;width:auto;transform:none}
@media (max-width:700px){body:not(.land) #ctrlbar{flex-direction:row;left:6px;right:6px;top:auto;bottom:132px;gap:4px}body:not(.land) #ctrlbar button{flex:1;width:auto;min-width:0}}
@media (max-width:700px){body.ctrlb:not(.land) #aide{bottom:190px}}
#ctrlbtn{display:none;position:fixed;right:8px;top:118px;z-index:3;background:#0b0b0bee;border:1px solid #3d6b3f;color:#cfe;border-radius:12px;padding:7px 10px;font:600 12px -apple-system,Roboto,sans-serif}
body.land #ctrlbtn{top:166px;right:6px;width:50px;padding:7px 0;font-size:0}body.land #ctrlbtn::first-letter{font-size:17px}body.land.left #ctrlbtn{right:auto;left:6px}
#ctrlbar{display:none;position:fixed;left:8px;top:160px;flex-direction:column;gap:5px;z-index:3}
#ctrlbar button{width:70px;background:#0b0e0bee;border:1px solid #2d4a2f;border-radius:10px;color:#ddd;padding:4px 2px;display:flex;flex-direction:column;align-items:center;gap:1px}#ctrlbar .ci{font-size:17px;line-height:1.1}#ctrlbar .cs2{font:600 9.5px ui-monospace,monospace;color:#8bff6a;white-space:nowrap}#ctrlbar button.lock{opacity:.45}
body.land #ctrlbar{left:184px;right:66px;top:auto;bottom:4px;flex-direction:row;gap:4px}body.land.left #ctrlbar{left:66px;right:184px}
body.land #ctrlbar button{flex:1;width:auto;min-width:0;flex-direction:row;justify-content:center;gap:4px;padding:6px 2px}body.land #ctrlbar .ci{font-size:14px}
/* Choix de difficulté (campagne) */
.diffs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0 10px}.diff{background:#111;border:1px solid #333;border-radius:10px;color:#ddd;padding:7px 8px;text-align:left;font:12px/1.3 -apple-system,Roboto,sans-serif}
.diff b{display:block;font-size:13px;margin-bottom:2px}.diff small{color:#999;font-size:10.5px}.diff.on{border-color:#ffe94d;background:#2a2608}.diff.on b{color:#ffe94d}
@media (max-width:480px){.diff small{display:none}}
/* Modes en plus (progres.js) et bilan de fin */
.modes{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 10px}.mode{background:#0f1a10;border:1px solid #3d6b3f;border-radius:10px;color:#ddd;padding:8px;text-align:left;font:12px/1.3 -apple-system,Roboto,sans-serif}
.mode b{display:block;font-size:13.5px;color:#cfe;margin-bottom:2px}.mode small{color:#9a9;font-size:11px}.mode.lock{opacity:.5}
.lv.defi{border-style:dashed;border-color:#a85a3a}.lv.defi b{color:#ff9a6a}
.bilan{background:#0b120b;border:1px solid #2d4a2f;border-radius:10px;padding:8px;margin:10px 0;text-align:left;font-size:12px}.bilan svg{width:100%;height:90px;display:block;margin:6px 0;border-radius:6px}
.bilan .bleg{display:flex;flex-wrap:wrap;gap:8px;font-size:12px}.bilan p{margin:5px 0;color:#bbb}
@media (max-width:480px){.modes{grid-template-columns:1fr}}
/* Fiche du bac : climat, étiquette, modèle (milieu.js, salle2.js) */
.clims{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:6px 0}.clims .dim{font-size:11px;margin-right:2px}
.clim,.mod{background:#111;border:1px solid #333;border-radius:8px;color:#ddd;padding:5px 8px;font:600 12px -apple-system,Roboto,sans-serif}.clim.on,.mod.on{border-color:#ffe94d;color:#ffe94d;background:#2a2608}
.etq{width:24px;height:24px;border-radius:50%;border:2px solid #333;color:#888;font-size:11px;padding:0}.etq.on{border-color:#fff;box-shadow:0 0 0 2px #ffe94d}
#partp textarea,#partp textarea{width:100%;box-sizing:border-box;background:#0b0b0b;color:#cfe;border:1px solid #333;border-radius:8px;font:11px ui-monospace,monospace;padding:6px;margin:6px 0}
.agrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.agrid figure{margin:0;background:#111;border:1px solid #333;border-radius:8px;overflow:hidden;cursor:pointer}
.agrid img{width:100%;display:block;aspect-ratio:4/3;object-fit:cover}.agrid figcaption{padding:4px 6px;font-size:11px;color:#ccc}.agrid small{color:#888}
#obsx{display:none;position:fixed;top:8px;right:8px;z-index:50;background:#0008;border:1px solid #fff4;color:#fff;border-radius:50%;width:36px;height:36px;font-size:16px;opacity:.55}
body.obs>*:not(#c):not(#obsx):not(#toast):not(#end):not(#brief):not(#absp){display:none!important}body.obs #obsx{display:block}
#vnav{flex-wrap:wrap;max-width:calc(100vw - 16px)}
.nuitsalle{position:absolute;inset:0;background:#030818;pointer-events:none;z-index:1}.viv.allume{z-index:2;box-shadow:0 0 18px #ffe9a055}
#rimp,#ralb{margin-left:4px}#partp,#albp,#albv,#absp{z-index:60}#albv{z-index:61}
/* Encyclopédie, quiz, découvertes, carte (savoir.js) */
#quizp,#decp,#chapp{z-index:70}
.card .taille{background:#1a2a3a;color:#9cd0ff}.card .latin{display:block;font-style:italic;color:#888;font-size:12px;margin:2px 0}.card .anec{background:#1a1808;border-left:3px solid #ffe94d;padding:5px 8px;border-radius:4px;color:#e8e0b0}
#fquiz,#fdec{background:#111;border:1px solid #3d6b3f;color:#cfe;border-radius:10px;padding:6px 10px;margin-left:8px;font:600 13px -apple-system,Roboto,sans-serif}
.decs{display:grid;gap:6px}.dec{display:flex;gap:10px;align-items:center;background:#0d0d0d;border:1px solid #2a2a2a;border-radius:10px;padding:7px 10px;opacity:.55}.dec.on{opacity:1;border-color:#3d6b3f}.dec span{font-size:24px}.dec small{display:block;color:#999;font-size:11.5px}
.qq{font-size:16px;color:#fff;margin:10px 0}.qr{display:grid;gap:6px}.qr button{text-align:left}.qr .bon{border-color:#8bff6a!important;color:#8bff6a!important}.qr .faux{border-color:#ff6a6a!important;color:#ff6a6a!important}
.carte{position:relative;margin:8px 0 12px;border-radius:16px;overflow:hidden;background:radial-gradient(circle at 20% 15%,#1f3a1c,#0f1f0e 60%),#0f1f0e;border:1px solid #2d4a2f}
.carte svg{position:absolute;inset:0;width:100%;height:100%}.carte .deco{position:absolute;font-size:18px;opacity:.35;pointer-events:none}
.etape{position:absolute;width:68px;display:flex;flex-direction:column;align-items:center;background:none;border:0;color:#eee;padding:0;font:600 12px -apple-system,Roboto,sans-serif;text-align:center}
.etape .eic{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;background:#16301a;border:3px solid #8bff6a;box-shadow:0 4px 14px #000a}
.etape b{width:130px;margin-top:4px;text-shadow:0 1px 3px #000}.etape small{color:#bcd;font-size:11px}.etape.lock{opacity:.5}.etape.lock .eic{border-color:#555;background:#1a1a1a}.etape.fini .eic{border-color:#ffe94d;background:#2a2608}
/* Fond d'écran (grand.js) */
body.fond #toast,body.fond #obsx{display:none!important}
/* Fiche à côté (grand.js) */
#cote{display:none;position:fixed;right:0;top:0;bottom:0;width:var(--cote,0px);box-sizing:border-box;overflow-y:auto;background:#0b0e0bf6;border-left:1px solid #2d4a2f;padding:12px 12px 20px;color:#ddd;font:13px/1.45 -apple-system,Roboto,sans-serif;z-index:3}
#cote h2{font:700 17px Georgia,serif;color:#fff;margin:2px 0 6px}#cote .cmis{color:#ffe94d;margin:4px 0 8px}#cote .badge{display:inline-block;background:#1a2a1a;border:1px solid #3d6b3f;border-radius:8px;padding:1px 7px;font-size:11.5px;margin:0 3px 6px 0}
#cote u{color:#8bff6a;text-decoration:none;font-weight:600;margin-right:4px}#cote p{margin:6px 0}#cote .anec{background:#1a1808;border-left:3px solid #ffe94d;padding:5px 8px;border-radius:4px;color:#e8e0b0}
#cote .cpop{display:flex;flex-wrap:wrap;gap:8px;font-size:15px;margin:8px 0}#cote .cj{font-size:12px;color:#aaa;margin:3px 0}
body.cotew #viewsw,body.cotew #zoomui,body.cotew #undo,body.cotew #suivi{margin-right:var(--cote)}body.cotew #pal,body.cotew #drawer,body.cotew #bar,body.cotew #aide,body.cotew #soin{left:8px!important;right:calc(var(--cote) + 8px)!important;width:auto!important;transform:none!important}
body.cotew #soin{bottom:auto;top:150px;max-height:calc(100vh - 320px);overflow-y:auto}
/* Carnet de Camille (histoire.js) */
#carnet{display:none;position:fixed;left:10px;right:10px;bottom:140px;z-index:4;background:#efe3c2;color:#3a2a14;border-radius:4px;padding:12px 30px 10px 34px;font:14px/1.42 Georgia,serif;box-shadow:0 6px 18px #000b;
 background-image:repeating-linear-gradient(#efe3c2 0 21px,#d8c79c 21px 22px);transform:rotate(-1deg)}
#carnet:before{content:'';position:absolute;left:22px;top:0;bottom:0;width:2px;background:#d07a6a}
#carnet .sk{position:absolute;right:28px;top:-34px}#carnet h4{margin:0 0 4px;font:italic 700 15px Georgia,serif;color:#5a3a14}#carnet .mis{font-style:italic;color:#6a3010;margin-top:4px;font-size:13px}
#carnet .cx{position:absolute;right:6px;top:6px;background:none;border:0;color:#7a5a30;font-size:15px;padding:2px 4px}
#carnet.vu{animation:carnetin .35s ease-out}@keyframes carnetin{from{opacity:0;transform:translateY(14px) rotate(-1deg)}to{opacity:1;transform:rotate(-1deg)}}
@media (min-width:900px){body:not(.land) #carnet{left:50%;right:auto;width:min(calc(100% - 20px),600px);transform:translateX(-50%) rotate(-1deg)}#carnet.vu{animation:none}}
body.land #carnet{left:184px;right:66px;bottom:auto;top:46px;font-size:13px}body.land.left #carnet{left:66px;right:184px}
body.cotew #carnet{left:10px!important;right:calc(var(--cote) + 10px)!important;width:auto!important;transform:rotate(-1deg)!important}
@media (max-width:700px){body.ctrlb:not(.land) #carnet{bottom:192px}}
.carnetbrief{display:block;margin:10px 0;background:#efe3c2;color:#3a2a14;border-radius:4px;padding:9px 12px;font:13.5px/1.4 Georgia,serif;text-align:left;background-image:repeating-linear-gradient(#efe3c2 0 20px,#d8c79c 20px 21px)}
.carnetbrief b{display:block;font-style:italic;color:#5a3a14;margin-bottom:3px}.carnetbrief span{display:block}.carnetbrief i{display:block;color:#6a3010;margin-top:4px}
#carnetp{z-index:62}.livre{display:grid;gap:8px}.livre .lp{background:#efe3c2;color:#3a2a14;border-radius:4px;padding:8px 12px;font:13.5px/1.4 Georgia,serif}.livre h4{margin:0 0 3px;font-style:italic;color:#5a3a14}.livre p{margin:0}.livre small{color:#7a6040}
/* Soins (soins.js) */
#soin{display:none;position:fixed;left:8px;right:8px;bottom:134px;z-index:5;background:#0e0b0bf4;border:1px solid #b07a4a;border-radius:12px;padding:8px 10px;font:12.5px/1.4 -apple-system,Roboto,sans-serif;color:#eee;box-shadow:0 6px 20px #000a}
#soin b{font-size:14px;color:#ffd9a0}#soin p{margin:4px 0}#soin ol{margin:4px 0 4px 18px;padding:0}#soin li{margin:2px 0}#soin .sx{position:absolute;right:6px;top:6px;background:#111;border:1px solid #444;color:#ccc;border-radius:50%;width:24px;height:24px;padding:0}
#soin .sbtn{display:flex;gap:6px}#soin .sbtn .btn,#soin .sbtn .btn2{margin:4px 0 0;padding:7px;font-size:13px}
@media (min-width:900px){body:not(.land) #soin{left:50%;right:auto;width:min(calc(100% - 16px),640px);transform:translateX(-50%)}}body.land #soin{left:184px;right:66px;bottom:auto;top:50px}body.land.left #soin{left:66px;right:184px}
.soinchip{color:#ffb07a;cursor:pointer;margin-left:6px}.card.sante{border-color:#b07a4a}
/* Confort (confort.js) */
#tuto .thand{display:none;position:fixed;font-size:30px;z-index:41;pointer-events:none;filter:drop-shadow(0 2px 4px #000);animation:tap 1.1s ease-in-out infinite}
@keyframes tap{0%,100%{transform:translate(0,10px) scale(1)}45%{transform:translate(0,0) scale(.88)}55%{transform:translate(0,0) scale(.88)}}
#undo{display:none;position:fixed;right:8px;top:110px;z-index:4;background:#0b0b0bee;border:1px solid #ffe94d88;color:#ffe94d;border-radius:18px;padding:6px 14px;font:600 13px -apple-system,Roboto,sans-serif}
body.land #undo span{display:none}
#suivi{display:none;position:fixed;left:50%;transform:translateX(-50%);top:58px;z-index:4;gap:6px;align-items:center;background:#0b0b0bee;border:1px solid #6ad0ff88;border-radius:18px;padding:4px 6px 4px 12px;color:#cfe;font:600 12px -apple-system,Roboto,sans-serif}
#suivi button{background:#111;border:1px solid #444;color:#ddd;border-radius:12px;padding:4px 8px;font:inherit}
#loupep{z-index:62}#loupep canvas{width:100%;height:auto;border-radius:8px;background:#0b120b;display:block;margin:6px 0}
body.grand .box,body.grand #hud,body.grand #pal,body.grand #ctrlbar,body.grand #vnav,body.grand #aide{zoom:1.15}
body.tgrand .box,body.tgrand #hud,body.tgrand #pal,body.tgrand #ctrlbar,body.tgrand #vnav,body.tgrand #aide{zoom:1.32}
body.contraste #c{filter:contrast(1.3) saturate(1.25) brightness(1.08)}body.contraste .box{border-color:#fff!important}body.contraste .dim{color:#ddd!important}body.contraste #hud{background:#000}
body.dalto-d #c{filter:url(#fdeut)}body.dalto-p #c{filter:url(#fprot)}body.contraste.dalto-d #c{filter:url(#fdeut) contrast(1.3)}body.contraste.dalto-p #c{filter:url(#fprot) contrast(1.3)}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hud"></div>
<button id="bback"></button><div id="viewsw"><button data-v="side">▭ Coupe</button><button data-v="ens">◪ 3/4</button><button data-v="top">◉ Dessus</button></div>
<div id="zoomui"><button id="zin">＋</button><button id="zout">－</button><button id="zens" title="Vue d'ensemble">⌂</button><button id="zlink" title="Liens">🔗</button></div>
<div id="legend"></div>
<div id="devp"></div>
<div id="drawer"></div><div id="pal"></div>
<div id="bar">
  <button id="blv">🗺 Niveaux<small>menu</small></button>
  <button id="bfiche">📖 Fiches<small>espèces</small></button>
  <button id="brestart">↺ Rejouer<small>niveau</small></button>
  <button id="spd">×1<small>vitesse</small></button>
  <button id="snd">🔊<small>son</small></button>
</div>
<div id="title" class="ov"><div class="tbox">
  <div class="ttop"><div class="tlogo"><span>VIVARIOM</span><small>Un petit monde vivant sous verre, à faire tenir en équilibre</small></div>
  <div class="tbugs">🌱 🐜 🐞 🕷 🪲 🐝 🪱 🦗 🦋 🐌</div></div><div class="tbtns">
  <button class="tbtn" id="tcamp">🗺 Campagne<small>des défis par espèce, chapitre après chapitre</small></button>
  <button class="tbtn" id="tsand">🏠 Bac à sable<small>ta pièce et tes vivariums, sans objectif</small></button>
  <button class="tbtn" id="tfiche">📖 Encyclopédie<small>les fiches de toutes les espèces</small></button>
  <button class="tbtn" id="tach">🏆 Succès<small>tes trouvailles et exploits</small></button>
  <button class="tbtn alt" id="topt">⚙ Options</button>
  <button class="tlink" id="ttuto">🎓 Revoir le tutoriel</button>
</div></div></div>
<div id="opts" class="ov"></div>
<div id="lic" class="ov"><div class="box"><h1>📜 Licences et crédits</h1>
<p><b>Vivariom</b> — jeu de vivarium. Code, dessins (générés par le programme) et textes créés pour ce projet, avec l'aide de Claude (Anthropic).</p>
<p><b>Licence du jeu</b> : © 2026 grecdel — tous droits réservés. Toute copie, modification ou redistribution, en tout ou en partie, nécessite l'accord de grecdel.</p>
<p><b>Bibliothèques</b> : aucune. Le jeu tient dans un seul fichier, sans code tiers.</p>
<p><b>Images</b> : aucune image externe. Les bêtes, plantes, décors et appareils sont dessinés en direct par le programme.</p>
<p><b>Sons</b> : synthétisés en direct par le navigateur (Web Audio). Aucun fichier son.</p>
<p><b>Polices</b> : polices système de l'appareil.</p>
<p><b>Emoji</b> : affichés par le système de l'appareil, par exemple Noto Color Emoji (Google, licence SIL Open Font License 1.1) sur Android et Linux, ou Apple Color Emoji sur iPhone et Mac.</p>
<p><b>Noms d'espèces</b> : noms communs et scientifiques usuels (savoir naturaliste public). Les comportements sont simplifiés pour le jeu.</p>
<button class="btn" id="licok">Fermer</button></div></div>
<div id="room"><div class="rhead"><button class="back" id="rback">←</button><b>La grande salle</b><span id="rcount" class="dim"></span><button class="back" id="rstyle">🎨</button><button class="back" id="rmode">☰ Liste</button><button id="radd">＋</button></div><div id="rscroll"><div id="roomin"></div></div><div id="rlist"></div><div id="rhint"></div><div id="rdim"></div><div id="rsheet"></div></div>
<div id="stylep" class="ov"></div><div id="vnav"><button id="vnsalle">🏛 Salle</button><button id="vnbacs">⇄ Bacs</button><button id="vncouve">🥚</button><button id="vnjournal">📓</button></div><div id="journal" class="ov"></div><div id="achp" class="ov"></div><div id="couvep" class="ov"></div><div id="toast"></div><div id="vstrip"></div>
<div id="vsheet" class="ov"><div class="box"><h1>Vivarium</h1><input id="vsname" maxlength="24"><button class="btn" id="vsin">Entrer</button><button class="btn2" id="vsok">Enregistrer le nom</button><button class="btn2" id="vsdel"></button></div></div>
<div id="menu" class="ov"><div class="box">
  <h1>VIVARIUM — BIOME</h1>
  <p style="color:#888;font-style:italic">Un terrarium en coupe : plantes, sol, humidité et dix espèces liées entre elles.</p>
  <p>À chaque niveau, fais <b>cohabiter</b> plusieurs espèces sans qu'aucune ne disparaisse. Tout est lié : les plantes boivent l'eau du sol, les pucerons sucent les plantes, les fourmis élèvent les pucerons, les coccinelles les mangent, les cloportes et les lombrics recyclent la litière en humus…</p>
  <p class="dim">Choisis un niveau :</p>
  <div id="levels"></div>
</div></div>
<div id="brief" class="ov"><div class="box"><div id="lvltxt"></div><button class="btn" id="bgo">Commencer</button><button class="btn2" id="bfiche2">📖 Lire les fiches d'abord</button><button class="btn2" id="bbrief">← Retour aux niveaux</button></div></div>
<div id="end" class="ov"><div class="box"><div id="endtxt"></div><button class="btn" id="bnext">Niveau suivant</button><button class="btn2" id="bretry">↺ Rejouer</button><button class="btn2" id="bmenu">🗺 Niveaux</button></div></div>
<div id="tuto"><div class="thalo"></div><div class="tarrow"></div><div class="tbub"></div></div>
<div id="fiches" class="ov"><header><h1>Fiches des espèces</h1><button id="ffermer">Fermer ✕</button></header><div id="fgrid"></div></div>
<script>
(()=>{
const cv=document.getElementById('c'),mainCtx=cv.getContext('2d');let ctx=mainCtx;
let W=0,H=0,DPR=1;
const TAU=Math.PI*2,rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v;
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const hsl=(h,s,l,a=1)=>`hsla(${h|0},${s|0}%,${l|0}%,${a})`;
const LA=Math.atan2(-0.8,-0.6);const glowCache={};const BEATDELAY=0.07;
'''+lib+'\n'+core+'\n'+main+'''
})();
</script>
</body>
</html>'''
open('biome.html','w').write(html)
print(len(html))

# ---------- appli web installable (dossier web/, à mettre en ligne tel quel) ----------
import hashlib, json, os
os.makedirs('web', exist_ok=True)
head_pwa = ('<link rel="manifest" href="manifest.webmanifest">\n'
            '<meta name="theme-color" content="#0b0d0a">\n'
            '<link rel="icon" type="image/png" sizes="192x192" href="icones/icone-192.png">\n'
            '<link rel="apple-touch-icon" href="icones/apple-touch-icon.png">\n')
reg = ("<script>if('serviceWorker' in navigator&&location.protocol.startsWith('http'))"
       "addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>\n")
assert html.count('</head>') == 1 and html.count('</body>') == 1
web = html.replace('</head>', head_pwa + '</head>').replace('</body>', reg + '</body>')
open('web/index.html', 'w').write(web)
version = hashlib.sha1(web.encode()).hexdigest()[:10]
manifest = {
  "name": "Vivariom", "short_name": "Vivariom", "lang": "fr",
  "description": "Un vivarium d'insectes à faire vivre : campagne et bac à sable.",
  "start_url": "./", "scope": "./", "display": "fullscreen",
  "background_color": "#0b0d0a", "theme_color": "#0b0d0a",
  "icons": [
    {"src": "icones/icone-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "icones/icone-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "icones/icone-192-masque.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
    {"src": "icones/icone-512-masque.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
open('web/manifest.webmanifest', 'w').write(json.dumps(manifest, ensure_ascii=False, indent=1))
# service worker : réseau d'abord (les mises à jour arrivent dès qu'on est en ligne), mémoire sinon (hors ligne)
sw = """// Vivariom — fonctionnement hors ligne. Version VERSION (changée à chaque assemblage).
const CACHE='vivariom-VERSION';
const FILES=['./','index.html','manifest.webmanifest','icones/icone-192.png','icones/icone-512.png','icones/icone-192-masque.png','icones/icone-512-masque.png','icones/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// toucher une notification ramène au jeu
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(L=>{for(const c of L)if('focus' in c)return c.focus();return clients.openWindow('./')}))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  // pages : on redemande toujours au serveur s'il y a plus récent (sinon le navigateur peut garder l'ancienne 10 min)
  e.respondWith(fetch(r,r.mode==='navigate'||/\\/(index\\.html)?$/.test(new URL(r.url).pathname)?{cache:'no-cache'}:{}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});
""".replace('VERSION', version)
open('web/sw.js', 'w').write(sw)
print('web/ :', version)
