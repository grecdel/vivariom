# Dessine les icônes de l'appli installable (web/icones/). À relancer seulement si on veut changer l'icône.
from PIL import Image, ImageDraw
import math
def icone(S, marge):
    k=4; N=S*k  # dessin en grand puis réduction (bords lisses)
    im=Image.new('RGB',(N,N),(11,13,10)); d=ImageDraw.Draw(im)
    m=int(N*marge); x0,y0,x1,y1=m,int(m*1.15),N-m,N-int(m*0.85)
    w=x1-x0; h=y1-y0; r=int(w*0.06)
    sol=y0+int(h*0.55)
    # air du bac
    d.rounded_rectangle((x0,y0,x1,y1),r,fill=(22,30,24))
    # couches de terre ondulées
    couches=[(0.00,(92,62,38)),(0.30,(140,112,40)),(0.55,(104,58,40)),(0.80,(70,72,78))]
    for f,(c) in couches:
        pts=[(x0,y1)]
        for i in range(0,w+1,max(1,w//60)):
            yy=sol+int((y1-sol)*f)+int(math.sin(i/w*math.pi*2+f*5)*h*0.03*(1 if f else 0.4))
            pts.append((x0+i,yy))
        pts.append((x1,y1)); d.polygon(pts,fill=c)
    # surface herbeuse
    d.line([(x0,sol),(x1,sol)],fill=(139,255,106),width=max(2,N//110))
    # pousse
    cx=x0+int(w*0.5); tige_h=int(h*0.42); lw=max(3,N//60)
    d.line([(cx,sol),(cx,sol-tige_h)],fill=(139,255,106),width=lw)
    for sgn,yy,L in [(-1,0.45,0.20),(1,0.75,0.24)]:
        by=sol-int(tige_h*yy); L=int(w*L)
        d.polygon([(cx,by),(cx+sgn*L*0.5,by-L*0.38),(cx+sgn*L,by-L*0.12),(cx+sgn*L*0.45,by+L*0.16)],fill=(40,110,40),outline=(139,255,106))
    d.ellipse((cx-lw*2,sol-tige_h-lw*2,cx+lw*2,sol-tige_h+lw*2),fill=(255,105,180))
    # coins arrondis : on recolle l'intérieur à travers un masque
    mask=Image.new('L',(N,N),0);ImageDraw.Draw(mask).rounded_rectangle((x0,y0,x1,y1),r,fill=255)
    fond=Image.new('RGB',(N,N),(11,13,10));fond.paste(im,(0,0),mask);im=fond;d=ImageDraw.Draw(im)
    # néon jaune sous le couvercle + vitre
    d.rounded_rectangle((x0+int(w*0.12),y0+int(h*0.04),x1-int(w*0.12),y0+int(h*0.07)),r//3,fill=(255,233,77))
    d.rounded_rectangle((x0,y0,x1,y1),r,outline=(170,190,200),width=max(3,N//80))
    return im.resize((S,S),Image.LANCZOS)
for S in (192,512):
    icone(S,0.14).save(f'web/icones/icone-{S}.png')
    icone(S,0.22).save(f'web/icones/icone-{S}-masque.png')   # zone sûre pour les icônes rondes d'Android
icone(180,0.14).save('web/icones/apple-touch-icon.png')
print('ok')
