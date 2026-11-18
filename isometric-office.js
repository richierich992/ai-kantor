/* Mockup-aligned isometric office. Visual-only; preserves agent rooms, Firebase paths and work flows. */
const styles={finance:[0x4d9b73,0xe8f1e9,"FINANCE"],marketing_content:[0xd16d8d,0xf7e9ee,"MARKETING & CONTENT"],it_automation:[0x4a9ab6,0xe8f1f6,"IT & AUTOMATION"],research_intelligence:[0x638dc1,0xe9edf6,"RESEARCH"],hr_admin:[0x9378b7,0xf0eaf4,"HR & ADMIN"]};
const mat=(T,c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.7,...o});
function bx(T,p,w,h,d,x,y,z,m,sh=true){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=sh;p.add(o);return o}
function cyl(T,p,r,h,x,y,z,m){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
function sign(T,p,title,sub,color,x,y,z,w=4.8){
 const c=document.createElement('canvas');c.width=1024;c.height=224;const q=c.getContext('2d');
 const grad=q.createLinearGradient(0,0,1024,224);grad.addColorStop(0,'#102633');grad.addColorStop(.58,'#183a4a');grad.addColorStop(1,'#102b3d');
 q.fillStyle=grad;q.beginPath();q.roundRect(4,4,1016,216,26);q.fill();
 q.strokeStyle='rgba(210,239,247,.42)';q.lineWidth=3;q.stroke();
 const accent='#'+new T.Color(color).getHexString();
 q.fillStyle=accent;q.beginPath();q.roundRect(20,20,14,184,7);q.fill();
 q.fillStyle='rgba(255,255,255,.1)';q.beginPath();q.arc(78,76,28,0,Math.PI*2);q.fill();
 q.fillStyle=accent;q.beginPath();q.arc(78,76,13,0,Math.PI*2);q.fill();
 q.textBaseline='middle';q.textAlign='left';q.font='900 42px system-ui';q.fillStyle='#f7fbff';q.fillText(title,130,78,850);
 q.font='700 23px system-ui';q.fillStyle='#aec5d0';q.fillText(sub,132,148,850);
 q.fillStyle=accent;q.fillRect(132,184,Math.min(280,q.measureText(sub).width*.7),5);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;
 const material=new T.MeshBasicMaterial({map:tex,transparent:true,toneMapped:false,side:T.DoubleSide});
 const plane=new T.Mesh(new T.PlaneGeometry(w,w*.22),material);plane.position.set(x,y,z);p.add(plane);return plane
}
function tile(T){
 const c=document.createElement('canvas');c.width=c.height=1024;const q=c.getContext('2d');
 q.fillStyle='#d9e0df';q.fillRect(0,0,1024,1024);
 const size=256,tones=['#e6eae8','#dfe5e3','#e9ecea','#dce3e1','#e3e8e6','#e8e9e6'];
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){
  const tone=tones[(x*3+y*5)%tones.length],px=x*size,py=y*size;
  q.fillStyle='#b8c4c3';q.fillRect(px,py,size,size);
  q.fillStyle=tone;q.fillRect(px+3,py+3,size-6,size-6);
  const g=q.createLinearGradient(px,py,px+size,py+size);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(70,95,96,.035)');
  q.fillStyle=g;q.fillRect(px+3,py+3,size-6,size-6);
  q.strokeStyle='rgba(255,255,255,.45)';q.lineWidth=2;q.strokeRect(px+5,py+5,size-10,size-10);
 }
 // Very fine terrazzo flecks keep the floor from reading as a flat checkerboard.
 let seed=7319;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 for(let i=0;i<9000;i++){const x=rand()*1024,y=rand()*1024,r=.35+rand()*1.4;q.fillStyle=rand()>.5?'rgba(87,112,112,.13)':'rgba(255,255,255,.4)';q.fillRect(x,y,r,r)}
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(5,3);tex.anisotropy=8;return tex
}
function woodGrain(T){
 const c=document.createElement('canvas');c.width=512;c.height=256;const q=c.getContext('2d');
 const base=q.createLinearGradient(0,0,0,256);base.addColorStop(0,'#c59b70');base.addColorStop(.48,'#a77d54');base.addColorStop(1,'#d0aa7e');q.fillStyle=base;q.fillRect(0,0,512,256);
 let seed=4187;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 for(let i=0;i<310;i++){const y=rand()*256,amp=1+rand()*6,alpha=.025+rand()*.075;q.strokeStyle=rand()>.52?'rgba(75,43,23,'+alpha+')':'rgba(255,242,219,'+alpha+')';q.lineWidth=.4+rand()*2;q.beginPath();q.moveTo(0,y);for(let x=0;x<=512;x+=16)q.lineTo(x,y+Math.sin(x*.018+i)*amp+Math.sin(x*.051+i*.7)*amp*.22);q.stroke()}
 for(let i=0;i<12;i++){const x=rand()*512,y=rand()*256;q.strokeStyle='rgba(75,45,26,.12)';q.lineWidth=1;q.beginPath();q.ellipse(x,y,9+rand()*22,2+rand()*5,rand(),0,Math.PI*2);q.stroke()}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1.8,1);t.anisotropy=8;return t
}
function fabricWeave(T){
 const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d');q.fillStyle='#587487';q.fillRect(0,0,256,256);
 for(let y=0;y<256;y+=4)for(let x=0;x<256;x+=4){q.fillStyle=(x+y)%8?'rgba(238,248,252,.055)':'rgba(9,26,39,.09)';q.fillRect(x,y,2.2,2.2)}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=4;return t
}
function keyboardTexture(T){
 const c=document.createElement('canvas');c.width=512;c.height=180;const q=c.getContext('2d');
 q.fillStyle='#172630';q.fillRect(0,0,512,180);
 for(let row=0;row<4;row++)for(let col=0;col<15;col++){const x=10+col*33,y=10+row*39,w=(row===3&&col>3&&col<10)?31:27;q.fillStyle='#71828b';q.beginPath();q.roundRect(x,y,w,27,5);q.fill();q.fillStyle='rgba(255,255,255,.22)';q.fillRect(x+4,y+4,w-8,2)}
 q.fillStyle='#65c6cf';q.beginPath();q.roundRect(150,130,210,25,5);q.fill();
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t
}
function departmentDisplay(T,scene,z){
 const [a,b,c,d]=z.box,w=b-a,cx=(a+b)/2,col=styles[z.id]?.[0]||0x65c6cf,title=styles[z.id]?.[2]||'TEAM';
 const pw=Math.min(6.8,Math.max(4.3,w*.48)),ph=1.62,py=2.18,pz=c+.19;
 const frame=mat(T,0x172b35,{metalness:.38,roughness:.32}),rim=mat(T,col,{emissive:col,emissiveIntensity:.22,metalness:.32,roughness:.3});
 bx(T,scene,pw+.28,ph+.24,.12,cx,py,pz-.045,frame,false);
 bx(T,scene,pw+.12,ph+.08,.045,cx,py,pz+.028,rim,false);
 const can=document.createElement('canvas');can.width=1024;can.height=360;const q=can.getContext('2d');
 const bg=q.createLinearGradient(0,0,1024,360);bg.addColorStop(0,'#0c1d29');bg.addColorStop(1,'#173746');q.fillStyle=bg;q.fillRect(0,0,1024,360);
 q.fillStyle='#'+new T.Color(col).getHexString();q.fillRect(0,0,14,360);q.font='800 35px system-ui';q.fillStyle='#f3fbff';q.fillText(title+' / LIVE OVERVIEW',46,58);
 q.font='600 18px system-ui';q.fillStyle='#a8c4d0';q.fillText('WORKSPACE TELEMETRY   •   SYSTEM ONLINE',46,91);
 for(let i=0;i<4;i++){const x=46+i*237;q.fillStyle='rgba(207,230,239,.09)';q.beginPath();q.roundRect(x,116,207,74,10);q.fill();q.fillStyle='#'+new T.Color(col).getHexString();q.font='800 24px system-ui';q.fillText(['ACTIVE','TASKS','QUEUE','UPTIME'][i],x+14,147);q.font='700 19px system-ui';q.fillStyle='#eaf5f8';q.fillText(['16','08','03','99.8%'][i],x+14,174)}
 q.strokeStyle='#'+new T.Color(col).getHexString();q.lineWidth=4;q.beginPath();const pts=[0,27,18,39,26,55,44,65,38,79,62,91,70,98];pts.forEach((v,i)=>{const x=48+i*68,y=300-v*1.25;i?q.lineTo(x,y):q.moveTo(x,y)});q.stroke();
 q.fillStyle='rgba(210,236,245,.16)';q.fillRect(46,320,900,2);
 const tex=new T.CanvasTexture(can);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;
 const screen=new T.Mesh(new T.PlaneGeometry(pw,ph),new T.MeshBasicMaterial({map:tex,toneMapped:false,side:T.DoubleSide}));screen.position.set(cx,py,pz+.055);screen.renderOrder=5;scene.add(screen);
 for(let i=0;i<3;i++){const cc=[0x53d7b4,0x67c6e7,0xf1c36a][i],led=new T.Mesh(new T.SphereGeometry(.035,8,8),mat(T,cc,{emissive:cc,emissiveIntensity:.7}));led.position.set(cx+pw/2-.25-i*.13,py-ph/2+.14,pz+.07);scene.add(led)}
}
function socialSofa(T,parent,x,z,m,scale=1){
 const g=new T.Group();g.position.set(x,0,z);parent.add(g);
 roundedSlab(T,g,3.7*scale,1.12*scale,.48*scale,.26*scale,m.seat,0,.28,0);
 roundedSlab(T,g,3.7*scale,.24*scale,.92*scale,.18*scale,m.seat,0,.77,-.43*scale);
 [-1.72,1.72].forEach(px=>roundedSlab(T,g,.28*scale,.9*scale,.78*scale,.13*scale,m.frame,px,.39,0));
 for(let i=0;i<3;i++){const cushion=new T.Mesh(new T.SphereGeometry(.48,12,10),m.pillow);cushion.scale.set(.95,.22,.72);cushion.position.set((i-1)*1.08*scale,.57,.02);g.add(cushion)}
 return g
}
function addSocialInteriors(T,scene,m){
 const cafe=new T.Group();cafe.name='mockup-cafe-counter';cafe.position.set(-21,-.02,-4.15);scene.add(cafe);
 roundedSlab(T,cafe,6.3,1.18,.88,.2,m.frame,0,.44,0);
 roundedSlab(T,cafe,6.6,1.34,.12,.23,m.lightDesk,0,.94,0);
 bx(T,cafe,5.8,.045,.05,0,.62,.62,m.accent,false);
 sign(T,cafe,'COFFEE BAR','FRESH BREW • TAKE A BREAK',0xd4a267,0,2.1,-.12,4.9);
 for(let i=0;i<4;i++){const x=-2.25+i*1.5,stool=new T.Group();stool.position.set(x,0,.95);cafe.add(stool);cyl(T,stool,.25,.12,0,.66,0,m.seat);cyl(T,stool,.055,.64,0,.33,0,m.metal);cyl(T,stool,.3,.055,0,.04,0,m.metal);const foot=new T.Mesh(new T.TorusGeometry(.23,.035,6,18),m.metal);foot.rotation.x=Math.PI/2;foot.position.y=.25;stool.add(foot)}
 bx(T,cafe,1.05,.72,.58,-1.85,1.35,-.03,m.frame);bx(T,cafe,.82,.36,.045,-1.85,1.38,.27,m.accent,false);
 for(let i=0;i<3;i++){cyl(T,cafe,.15,.18,1.25+i*.35,1.12,.12,m.lightDesk);cyl(T,cafe,.13,.07,1.25+i*.35,1.25,.12,m.accent)}
 socialSofa(T,scene,29.4,1.15,m,0.92);
 roundedSlab(T,scene,2.2,1.35,.16,.22,m.wood,29.4,.56,3.0);
 cyl(T,scene,.11,.12,28.8,.72,2.9,m.lightDesk);cyl(T,scene,.11,.12,29.4,.72,2.9,m.lightDesk);
 const shelf=new T.Group();shelf.name='mockup-reading-bookshelf';shelf.position.set(-40.65,0,15.4);scene.add(shelf);
 bx(T,shelf,2.5,2.55,.26,0,1.27,0,m.frame);for(let y of [.55,1.24,1.93])bx(T,shelf,2.42,.09,.48,0,y,.12,m.wood);
 for(let row=0;row<3;row++)for(let i=0;i<7;i++){const hh=.42+((i*7+row)%2)*.12,book=bx(T,shelf,.2+((i+row)%3)*.035,hh,.32,-.98+i*.32,.78+row*.68,.18,mat(T,[0x4b8992,0xc58d62,0x7387ad,0x8ba77a,0x9f7d9f][(i+row)%5]),false);book.rotation.z=((i%3)-1)*.035}
 const lamp=new T.Group();lamp.position.set(-32.2,0,15.6);scene.add(lamp);cyl(T,lamp,.055,2.15,0,1.07,0,m.metal);cyl(T,lamp,.48,.22,0,2.15,0,m.lightDesk);
 const shade=new T.Mesh(new T.ConeGeometry(.42,.5,20,1,true),m.lightDesk);shade.position.y=2.2;lamp.add(shade);
 const lampGlow=new T.PointLight(0xffd89a,.32,8,2);lampGlow.position.set(-32.2,2.1,15.6);scene.add(lampGlow);
 return {cafe,shelf,lamp}
}

function roundedSlab(T,parent,w,d,h,r,material,x,y,z){
 const shape=new T.Shape();shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.absarc(w/2-r,-d/2+r,r,-Math.PI/2,0,false);
 shape.lineTo(w/2,d/2-r);shape.absarc(w/2-r,d/2-r,r,0,Math.PI/2,false);
 shape.lineTo(-w/2+r,d/2);shape.absarc(-w/2+r,d/2-r,r,Math.PI/2,Math.PI,false);
 shape.lineTo(-w/2,-d/2+r);shape.absarc(-w/2+r,-d/2+r,r,Math.PI,Math.PI*1.5,false);
 const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:Math.min(r*.22,h*.22),bevelThickness:Math.min(r*.22,h*.22),curveSegments:5});
 geo.rotateX(-Math.PI/2);const mesh=new T.Mesh(geo,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh
}

function glassZone(T,scene,z){
 const [a,b,c,d]=z.box,w=b-a,depth=d-c,cx=(a+b)/2,cz=(c+d)/2,h=3.25,style=styles[z.id]||styles.finance;
 const frame=mat(T,0x52717e,{metalness:.42,roughness:.3}),glass=new T.MeshPhysicalMaterial({color:0xc5e4ee,transparent:true,opacity:.23,roughness:.2,metalness:.12,clearcoat:.28,clearcoatRoughness:.22,side:T.DoubleSide,depthWrite:false,forceSinglePass:true});
 const accent=mat(T,style[0],{emissive:style[0],emissiveIntensity:.2,roughness:.35});
 const carpetMat=mat(T,style[1],{roughness:.82});
 const carpet=new T.Mesh(new T.PlaneGeometry(w-.3,depth-.3),carpetMat);carpet.rotation.x=-Math.PI/2;carpet.position.set(cx,.052,cz);carpet.receiveShadow=true;scene.add(carpet);
 // Thin inset border gives each department pod its own finished floor treatment.
 const floorEdge=mat(T,style[0],{emissive:style[0],emissiveIntensity:.11,metalness:.22,roughness:.48});
 bx(T,scene,w-.55,.035,.055,cx,.064,d-.42,floorEdge,false);bx(T,scene,w-.55,.035,.055,cx,.064,c+.42,floorEdge,false);
 // Continuous low rails make each glass department pod read as a deliberate room.
 bx(T,scene,w,.08,.14,cx,.08,c,frame,false);bx(T,scene,w,.08,.14,cx,.08,d,frame,false);
 bx(T,scene,.14,.08,depth,a,.08,cz,frame,false);bx(T,scene,.14,.08,depth,b,.08,cz,frame,false);
 const back=bx(T,scene,w,h,.055,cx,h/2,c,glass,false);back.renderOrder=2;
 [a,b].forEach(x=>{const side=bx(T,scene,.055,h,depth,x,h/2,cz,glass,false);side.renderOrder=2});
 const gap=Math.min(3.2,w-1),seg=(w-gap)/2;
 [a+seg/2,b-seg/2].forEach(x=>{const panel=bx(T,scene,seg,h,.055,x,h/2,d,glass,false);panel.renderOrder=2});
 [[a,c],[b,c],[a,d],[b,d]].forEach(([x,zp])=>bx(T,scene,.12,h+.08,.13,x,h/2,zp,frame,false));
 bx(T,scene,w,.13,.16,cx,h+.035,c,frame,false);bx(T,scene,w,.13,.16,cx,h+.035,d,frame,false);
 // Color-coded kick plates and narrow LED strips identify divisions without visual clutter.
 bx(T,scene,w-.25,.075,.065,cx,.19,d-.04,accent,false);
 bx(T,scene,w-.25,.045,.035,cx,.035,c+.09,accent,false);
 const doorX=cx;
 bx(T,scene,.075,h-.12,.065,doorX,h/2,d,frame,false);
 bx(T,scene,.055,h-.3,.035,doorX+.45,h/2,d+.015,glass,false);
 const count=Math.max(1,Math.floor(depth/5));
 for(let i=1;i<count;i++){const zp=c+depth/count*i;bx(T,scene,.065,h,.085,a+.03,h/2,zp,frame,false);bx(T,scene,.065,h,.085,b-.03,h/2,zp,frame,false)}
 // Department nameplate is larger and mounted just above the entry glazing.
 sign(T,scene,style[2],"AI TEAM WORKSPACE",style[0],cx,3.18,d+.09,Math.min(7.6,Math.max(4.4,w*.42)));
 return carpet
}
function workstation(T,r,m){
 const g=r.g,group=new T.Group();group.name="mockup-workstation-"+r.id;g.userData.isMockupFurniture=true;group.position.set(0,0,0);r.g.add(group);
 const wood= m.wood,metal=m.metal,accent=m.accent;
 // Warm desk top, dark apron and inset front light.
 roundedSlab(T,group,3.1,1.5,.17,.16,wood,0,.82,-.45);
 bx(T,group,2.92,.1,.08,0,.76,.29,m.frame);
 bx(T,group,2.92,.12,.08,0,.79,.29,m.frame);
 bx(T,group,2.8,.045,.035,0,.73,.34,accent,false);
 [-1.4,1.4].forEach(x=>[-1,.05].forEach(z=>bx(T,group,.09,.78,.09,x,.4,z,metal)));
 // Monitor frame, live dashboard and a proper raised stand.
 bx(T,group,1.48,1,.12,-.48,1.55,-1.1,m.frame);
 if(r.screenMesh)r.screenMesh.visible=false;
 const mainScreen=new T.Mesh(new T.PlaneGeometry(1.35,.78),new T.MeshBasicMaterial({map:r.tx,toneMapped:false,side:T.DoubleSide}));
 mainScreen.position.set(-.48,1.55,-1.025);mainScreen.renderOrder=5;group.add(mainScreen);
 bx(T,group,.12,.28,.12,-.48,1.06,-1.1,metal);bx(T,group,.58,.055,.22,-.48,1.02,-1.1,metal);
 const telemetry=g.children.find(o=>o.userData?.phase8Monitor);
 if(telemetry){telemetry.visible=true;telemetry.position.set(.72,1.46,-1.1);telemetry.rotation.set(0,0,0);telemetry.scale.set(1,1,1);telemetry.renderOrder=5}
 // Keyboard, mouse, desktop tower with front vent details.
 bx(T,group,.88,.065,.31,-.48,1,-.18,m.frame);
 const keySurface=new T.Mesh(new T.PlaneGeometry(.82,.27),new T.MeshBasicMaterial({map:m.keysMap,toneMapped:false}));keySurface.rotation.x=-Math.PI/2;keySurface.position.set(-.48,1.035,-.18);group.add(keySurface);
 const mouse=new T.Mesh(new T.SphereGeometry(.13,12,10),m.mouse);mouse.scale.set(.82,.28,1.12);mouse.position.set(.55,1.045,-.17);group.add(mouse);
 bx(T,group,.3,.38,.26,-1.12,1.13,-.34,m.tower);
 bx(T,group,.32,.06,.025,-1.12,1.29,-.198,m.accent,false);
 for(let i=0;i<3;i++){const led=new T.Mesh(new T.SphereGeometry(.025,8,8),mat(T,0x5dd7bd,{emissive:0x2a897e,emissiveIntensity:.55}));led.position.set(-1.19+i*.07,1.13,-.19);group.add(led)}
 bx(T,group,.82,.18,.42,1.05,.56,-.28,m.frame);bx(T,group,.36,.035,.025,1.05,.61,-.055,m.metal,false);
 [-1.45,.48].forEach(x=>{bx(T,group,.22,.32,.22,x,1.13,-1.12,m.frame,false);cyl(T,group,.055,.035,x,1.19,-.995,m.accent)});
 const webcam=new T.Mesh(new T.SphereGeometry(.055,10,8),m.metal);webcam.position.set(-.48,2.06,-1.1);group.add(webcam);
 for(let i=0;i<4;i++)bx(T,group,.018,.2,.012,-1.22+i*.045,1.14,-.195,accent,false);
 // Ergonomic chair: rounded cushion, backrest, central post and five spokes.
 const seatPad=new T.Mesh(new T.SphereGeometry(.62,16,12),m.seat);seatPad.scale.set(.82,.22,.78);seatPad.position.set(0,.86,1);seatPad.castShadow=true;group.add(seatPad);
 const backrest=new T.Mesh(new T.SphereGeometry(.58,16,12),m.seat);backrest.scale.set(.78,.92,.22);backrest.position.set(0,1.34,1.36);backrest.rotation.x=-.12;backrest.castShadow=true;group.add(backrest);
 [-.53,.53].forEach(x=>{cyl(T,group,.045,.54,x,1.08,1.12,metal);bx(T,group,.12,.08,.52,x,1.34,1.12,m.seat)});
 cyl(T,group,.075,.42,0,.48,1,metal);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const spoke=bx(T,group,.56,.055,.075,Math.cos(a)*.25,.28,1+Math.sin(a)*.25,metal);spoke.rotation.y=a;const wheel=new T.Mesh(new T.CylinderGeometry(.095,.095,.07,12),m.frame);wheel.rotation.z=Math.PI/2;wheel.position.set(Math.cos(a)*.52,.12,1+Math.sin(a)*.52);group.add(wheel)}
 // Discreet desk lamp and a small succulent add scale to each station.
 cyl(T,group,.13,.05,1.17,.99,-.05,metal);cyl(T,group,.035,.32,1.17,1.16,-.05,metal);
 const lampHead=new T.Mesh(new T.SphereGeometry(.12,10,8),accent);lampHead.position.set(1.17,1.34,-.05);lampHead.scale.set(1,.55,.8);group.add(lampHead);
 cyl(T,group,.15,.15,1.35,.98,.12,mat(T,0x9b8066));
 const leafMat=mat(T,0x479d71);for(let i=0;i<3;i++){const leaf=new T.Mesh(new T.SphereGeometry(.12,8,6),leafMat);leaf.position.set(1.35+(i-1)*.09,1.15,.12);leaf.scale.set(.65,1.6,.7);group.add(leaf)}
 r.spot=g.localToWorld(new T.Vector3(0,0,2.35));r.inside=g.localToWorld(new T.Vector3(0,0,2.5));r.front=g.localToWorld(new T.Vector3(0,0,3.6));r.row=g.position.z<-17?'A':'B';r.isometricWorkstation=true
}
function createOfficeExtras(T,scene,m){
 const reception=new T.Group();reception.name="mockup-reception";reception.position.set(0,0,10.35);scene.add(reception);
 // Backdrop wall with a clear brand panel, warm slatted trim and a broad reception counter.
 bx(T,reception,8.6,3.35,.22,0,2.02,-1.03,m.frame,false);
 bx(T,reception,8.2,2.94,.08,0,2.02,-.88,mat(T,0x385b6a,{metalness:.35,roughness:.42}),false);
 [-3.9,-3.45,3.45,3.9].forEach(x=>bx(T,reception,.055,2.92,.11,x,2.02,-.81,m.accent,false));
 sign(T,reception,"KANTOR AI","INTELLIGENCE • CREATIVITY • AUTOMATION",0x64d1da,0,2.82,-.78,7.3);
 roundedSlab(T,reception,7.6,1.72,.62,.28,m.frame,0,.2,.02);
 roundedSlab(T,reception,7.9,1.92,.16,.3,m.lightDesk,0,.78,.02);
 bx(T,reception,6.95,.055,.055,0,.59,.92,m.accent,false);
 // Three concierge displays and a brushed-metal kick plate.
 [-1.45,0,1.45].forEach((x,i)=>{
  bx(T,reception,1.05,.72,.11,x,1.42,-.48,m.frame,false);
  const screen=new T.Mesh(new T.PlaneGeometry(.94,.58),new T.MeshBasicMaterial({color:i===1?0x16465a:0x102b3d,toneMapped:false}));
  screen.position.set(x,1.43,-.416);reception.add(screen);
  bx(T,reception,.34,.06,.28,x,1.04,-.28,m.metal,false);
 });
 const receptionPot=mat(T,0x77665a),receptionLeaves=mat(T,0x559b70),receptionLeafLight=mat(T,0x77b57f);
 [-5.3,5.3].forEach(x=>{
  cyl(T,reception,.42,.48,x,.24,.1,receptionPot);cyl(T,reception,.44,.055,x,.5,.1,m.lightDesk);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,leaf=new T.Mesh(new T.IcosahedronGeometry(.28,1),i%2?receptionLeafLight:receptionLeaves);leaf.position.set(x+Math.cos(a)*.22,1.0,.1+Math.sin(a)*.22);leaf.scale.set(.7,1.45,.72);reception.add(leaf)}
  const crown=new T.Mesh(new T.IcosahedronGeometry(.26,1),receptionLeafLight);crown.position.set(x,1.25,.1);reception.add(crown)
 });
 // The entry portal is pulled inward so it reads as part of the office rather than a detached edge prop.
 const portal=new T.Group();portal.name="mockup-entry-portal";portal.position.set(0,0,14.25);scene.add(portal);
 const portalFrame=mat(T,0x405d6b,{metalness:.48,roughness:.28}),portalAccent=mat(T,0x64d1da,{emissive:0x1d7b86,emissiveIntensity:.55,metalness:.42,roughness:.28});
 [-7,7].forEach(x=>{
  roundedSlab(T,portal,.72,.78,4.5,.18,portalFrame,x,0,0);
  bx(T,portal,.16,3.85,.08,x,2.22,.46,portalAccent,false);
  bx(T,portal,1,.14,.95,x,.13,0,m.lightDesk,false);
 });
 roundedSlab(T,portal,15.05,.86,.6,.2,portalFrame,0,4.02,0);
 bx(T,portal,13.4,.055,.11,0,3.71,.48,portalAccent,false);
 const doorGlass=new T.MeshPhysicalMaterial({color:0xc5e9f2,transparent:true,opacity:.24,roughness:.2,metalness:.1,clearcoat:.3,clearcoatRoughness:.2,side:T.DoubleSide,depthWrite:false,forceSinglePass:true});
 [-1.5,1.5].forEach(x=>{const panel=bx(T,portal,2.9,3.4,.055,x,1.98,0,doorGlass,false);panel.renderOrder=3;bx(T,portal,.065,3.48,.11,x,1.98,.08,portalFrame,false)});
 bx(T,portal,.1,3.48,.14,0,1.98,.08,portalFrame,false);
 sign(T,portal,"KANTOR AI","NEXT-GENERATION WORKPLACE",0x64d1da,0,4.12,.5,10.2);
 roundedSlab(T,scene,11.2,2.9,.055,.4,mat(T,0xdce9e8,{roughness:.68}),0,.025,12.45);
 [-5.35,5.35].forEach(x=>{cyl(T,portal,.18,.5,x,.25,1.25,m.metal);cyl(T,portal,.22,.07,x,.52,1.25,portalAccent)});
 const pantry=new T.Group();pantry.name="mockup-pantry";pantry.position.set(31,0,12.5);scene.add(pantry);bx(T,pantry,4.8,.95,1.15,0,.55,0,m.frame);bx(T,pantry,5.1,.14,1.3,0,1.08,0,m.lightDesk);[-1.4,0,1.4].forEach(x=>{cyl(T,pantry,.12,.8,x,.4,1,m.metal);cyl(T,pantry,.35,.12,x,.85,1,m.seat)});sign(T,pantry,"PANTRY","COFFEE • BREAK • REFRESH",0xd59e62,0,2.45,-.65,4.9);
 const tables=[];[[-8,2],[5,2],[-8,9],[5,9]].forEach(([x,z],i)=>{const g=new T.Group();g.name="mockup-collab-table-"+i;g.position.set(x,0,z);scene.add(g);bx(T,g,3.8,.14,1.8,0,.85,0,m.wood);[-1.7,1.7].forEach(dx=>[-.7,.7].forEach(dz=>bx(T,g,.1,.8,.1,dx,.4,dz,m.metal)));[-1,1].forEach(s=>bx(T,g,.8,.85,.8,s*2.4,.4,0,m.seat));tables.push(g)});
 const greenery=mat(T,0x4a956a),leafLight=mat(T,0x68ad78),pot=mat(T,0x75665a),potRim=mat(T,0xb8aa94);
 [[-10,-24],[12,-24],[-10,-8],[13,-8],[7,12],[-10,12]].forEach(([x,z],index)=>{
  const scale=index%2?.9:1;
  cyl(T,scene,.48*scale,.52*scale,x,.26*scale,z,pot);
  cyl(T,scene,.5*scale,.07*scale,x,.52*scale,z,potRim);
  cyl(T,scene,.39*scale,.025*scale,x,.56*scale,z,mat(T,0x4a3d35));
  const stem=new T.Mesh(new T.CylinderGeometry(.035*scale,.06*scale,.78*scale,7),greenery);stem.position.set(x,.92*scale,z);scene.add(stem);
  for(let i=0;i<5;i++){const angle=i*Math.PI*2/5,leaf=new T.Mesh(new T.IcosahedronGeometry(.34*scale,1),i%2?leafLight:greenery);leaf.position.set(x+Math.cos(angle)*.24*scale,1.03*scale+(i%2)*.1*scale,z+Math.sin(angle)*.24*scale);leaf.scale.set(.72,1.35,.72);leaf.rotation.z=(i%2?.22:-.22);scene.add(leaf)}
  const crown=new T.Mesh(new T.IcosahedronGeometry(.3*scale,1),leafLight);crown.position.set(x,1.35*scale,z);scene.add(crown)
 });
 [-30,-17,-2,15,32].forEach(x=>[-16,-5,8].forEach(z=>bx(T,scene,3.4,.09,.4,x,4.15,z,m.light,false)));
 return {reception,pantry,tables}
}
export function enhanceIsometricOffice({THREE,scene,rooms,characters,zones=[],zoneMeshes=[],camera,controls,setTarget}){
 if(scene.userData.isometricOfficeRebuild)return scene.userData.isometricOfficeRebuild;
 const woodMap=woodGrain(THREE),fabricMap=fabricWeave(THREE),keysMap=keyboardTexture(THREE);
 const m={wood:mat(THREE,0xffffff,{map:woodMap,roughness:.48,metalness:.04}),metal:mat(THREE,0x58666c,{metalness:.62,roughness:.32}),frame:mat(THREE,0x273a43,{metalness:.5,roughness:.34}),seat:mat(THREE,0xffffff,{map:fabricMap,roughness:.91}),pillow:mat(THREE,0x8aa0ad,{map:fabricMap,roughness:.94}),keyboard:mat(THREE,0xffffff,{map:keysMap,roughness:.8}),keysMap,mouse:mat(THREE,0x303a40),tower:mat(THREE,0x35454c),lightDesk:mat(THREE,0xe5ebe9,{roughness:.32,metalness:.12}),accent:mat(THREE,0x65c6cf,{emissive:0x1d5863,emissiveIntensity:.22,roughness:.32})};
 const baseMat=mat(THREE,0x253d49,{metalness:.42,roughness:.4}),floorMat=mat(THREE,0xffffff,{map:tile(THREE),roughness:.56,metalness:.025});
 bx(THREE,scene,88,.72,47,0,-.43,-4.5,baseMat);
 roundedSlab(THREE,scene,87.1,46.1,.12,.72,mat(THREE,0x435a62,{metalness:.35,roughness:.38}),0,-.055,-4.5);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(84,43),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(0,.012,-4.5);floor.receiveShadow=true;scene.add(floor);
 // Brass/cyan perimeter inlay and entry threshold define a finished architectural plinth.
 const edge=mat(THREE,0x6fcbd4,{emissive:0x267d91,emissiveIntensity:.28,metalness:.5,roughness:.3});
 bx(THREE,scene,84,.055,.09,0,.045,-26,edge,false);bx(THREE,scene,84,.055,.09,0,.045,17,edge,false);
 [-42,42].forEach(x=>bx(THREE,scene,.09,.055,43,x,.045,-4.5,edge,false));

 // Retire the old campus/yard render layers, preserving characters, rooms and Social Hub props.
 if(scene.userData.premiumWorldPhase2Root)scene.userData.premiumWorldPhase2Root.visible=false;
 if(scene.userData.premiumExperiencePhase7?.decorRoot)scene.userData.premiumExperiencePhase7.decorRoot.visible=false;
 // In the mockup-style interior, retain Social Hub props and occupancy dots but remove
 // the floating game labels and broad circular floor halos that clutter the cutaway.
 const socialDecor=scene.userData.premiumSocialDecor;
 socialDecor?.labels?.forEach(item=>{const sprite=item?.sprite||item;if(sprite)sprite.visible=false});
 socialDecor?.decor?.forEach(item=>{
  if(item.label)item.label.visible=false;
  if(item.ring)item.ring.visible=false;
  if(item.pad)item.pad.visible=false;
 });
 scene.traverse(o=>{
  const p=o.geometry?.parameters;
  if(o.name==="legacy-hr-placeholder"){o.visible=false;return;}
  if(!o.isMesh||!p)return;
  const bg=o.geometry.type==="BoxGeometry",pg=o.geometry.type==="PlaneGeometry";
  if(bg&&((p.width===420&&p.depth===300)||(p.width===88&&p.height===.7&&p.depth===47)))o.visible=false;
  if(pg&&((p.width===16&&p.height===8)||(p.width===280&&p.height===12)||((p.width===84&&p.height===43)&&o!==floor)))o.visible=false;
  if(o.geometry.type==="ConeGeometry"&&p.height===5&&p.radius===2.2)o.visible=false;
  if(bg&&p.width===3&&p.depth===.35&&Math.abs(o.position.z-31)<.5)o.visible=false;
  const oldPerimeter=bg&&p.height===3&&((p.width===84&&p.depth===.3&&Math.abs(o.position.z+26)<.3)||(p.width===.3&&p.depth===43&&Math.abs(Math.abs(o.position.x)-42)<.3));
  const oldLowWall=bg&&Math.abs(p.height-1)<.02&&Math.abs(p.depth-.5)<.02&&Math.abs(o.position.y-.5)<.12&&Math.abs(o.position.z-17)<.2&&Math.abs(p.width-36.6)<.1;
  const oldGatePost=bg&&Math.abs(p.width-.6)<.1&&Math.abs(p.height-4)<.1&&Math.abs(p.depth-.6)<.1&&Math.abs(Math.abs(o.position.x)-5.4)<.2&&Math.abs(o.position.z-17)<.2;
  const oldGateBeam=bg&&Math.abs(p.width-11.4)<.1&&Math.abs(p.height-.6)<.1&&Math.abs(p.depth-.6)<.1&&Math.abs(o.position.y-4.2)<.2&&Math.abs(o.position.z-17)<.2;
  const oldTreeTrunk=bg&&p.width===.5&&p.height===2&&p.depth===.5&&o.position.y===1&&(Math.abs(o.position.x)>44||Math.abs(o.position.z)>19);
  const oldZoneSide=bg&&Math.abs(o.position.y-.6)<.02&&p.width===.25&&Math.abs(p.height-1.1)<.02;
  const oldZoneRail=bg&&Math.abs(o.position.y-.6)<.02&&Math.abs(p.height-.1)<.02&&Math.abs(p.depth-.25)<.02;
  const oldZonePlaque=bg&&Math.abs(o.position.y-6)<.05&&Math.abs(p.height-1.3)<.02&&Math.abs(p.depth-.25)<.02;
  if(oldPerimeter||oldLowWall||oldGatePost||oldGateBeam||oldTreeTrunk||oldZoneSide||oldZoneRail||oldZonePlaque)o.visible=false;
 });
 const frame=mat(THREE,0x41535d,{metalness:.5}),glass=new THREE.MeshPhysicalMaterial({color:0xb3cbd7,transparent:true,opacity:.15,roughness:.18,side:THREE.DoubleSide,depthWrite:false});bx(THREE,scene,84,.5,.18,0,.25,-26,mat(THREE,0x46565d));const rear=bx(THREE,scene,83,3.1,.055,0,2,-25.87,glass,false);rear.renderOrder=2;for(let i=0;i<=14;i++)bx(THREE,scene,.09,3.25,.13,-41.2+i*5.88,2,-25.82,frame,false);
 [-42,42].forEach(x=>{bx(THREE,scene,.2,.5,43,x,.25,-4.5,mat(THREE,0x46565d));const p=bx(THREE,scene,.055,3,42,x,2,-4.5,glass,false);p.renderOrder=2;for(let i=0;i<=7;i++)bx(THREE,scene,.13,3.2,.08,x,2,-25.5+i*6,frame,false)});
 zones.forEach(z=>glassZone(THREE,scene,z));zoneMeshes.forEach(m=>{if(m)m.visible=false});
 Object.values(rooms).forEach(r=>{if(!r||r.meet||typeof r.id!=="number")return;const tele=r.g.children.find(o=>o.userData?.phase8Monitor);r.g.children.forEach(o=>{o.visible=o===tele});if(tele)tele.visible=false;workstation(THREE,r,m);const c=characters?.[r.id];if(c?.g){c.g.position.copy(r.spot);c.g.rotation.y=r.yaw+Math.PI;c.loc=r;c.path=[];c.done=null;c.face=r.yaw+Math.PI;c.busy=false}});
 const meeting=rooms[0];if(meeting?.g){const liveVisuals=meeting.g.children.filter(o=>o.geometry?.type==="TorusGeometry"||(o.geometry?.type==="PlaneGeometry"&&o.geometry.parameters?.width===4.2&&o.geometry.parameters?.height===1.4));meeting.g.children.forEach(o=>{o.visible=liveVisuals.includes(o)});meeting.g.scale.setScalar(1.12);bx(THREE,meeting.g,7,.06,6,0,.05,0,mat(THREE,0xe6ebe9));bx(THREE,meeting.g,5.5,.16,2.1,0,.82,-.4,m.wood);for(let i=0;i<3;i++){const x=-1.8+i*1.8;bx(THREE,meeting.g,.65,.6,.65,x,.4,-2,m.seat);bx(THREE,meeting.g,.65,.6,.65,x,.4,1.6,m.seat)}if(!liveVisuals.some(o=>o.geometry?.type==="PlaneGeometry"))sign(THREE,meeting.g,"MEETING ROOM","CROSS-DIVISION BRIEFING",0x55afc4,0,3,-3.2,5.5)}
 const extras=createOfficeExtras(THREE,scene,m);
 const socialInteriors=addSocialInteriors(THREE,scene,m);
 // Soft architectural fill lights and division-specific ceiling rafts give the glass pods depth.
 const fillA=new THREE.DirectionalLight(0xe4f5ff,.48);fillA.position.set(-38,34,-8);scene.add(fillA);
 const fillB=new THREE.DirectionalLight(0xffe5c6,.24);fillB.position.set(24,30,22);scene.add(fillB);
 const socialGlow=new THREE.PointLight(0x72d4e2,.55,48,2);socialGlow.position.set(-4,5,8);scene.add(socialGlow);
 zones.forEach(z=>{
  const [a,b,c,d]=z.box,w=b-a,depth=d-c,cx=(a+b)/2,cz=(c+d)/2,col=styles[z.id]?.[0]||0x65c6cf;
  const dark=mat(THREE,0x263e49,{metalness:.55,roughness:.35}),light=mat(THREE,col,{emissive:col,emissiveIntensity:.65,metalness:.3,roughness:.28});
  departmentDisplay(THREE,scene,z);
  // Slim floating canopy; open center keeps the isometric cutaway readable.
  bx(THREE,scene,w+.35,.1,.22,cx,4.18,c-.05,dark,false);bx(THREE,scene,w+.35,.1,.22,cx,4.18,d+.05,dark,false);
  bx(THREE,scene,.2,.1,depth+.25,a-.05,4.18,cz,dark,false);bx(THREE,scene,.2,.1,depth+.25,b+.05,4.18,cz,dark,false);
  bx(THREE,scene,w-.8,.045,.065,cx,4.105,c-.05,light,false);bx(THREE,scene,w-.8,.045,.065,cx,4.105,d+.05,light,false);
  for(let i=0;i<Math.max(2,Math.floor(w/7));i++){
   const lx=a+2.5+i*((w-5)/Math.max(1,Math.floor(w/7)-1));
   const pendant=new THREE.Group();pendant.position.set(lx,4.0,cz);scene.add(pendant);
   cyl(THREE,pendant,.035,.38,0,-.19,0,dark);cyl(THREE,pendant,.42,.07,0,-.43,0,dark);
   const diffuser=new THREE.Mesh(new THREE.CircleGeometry(.32,24),new THREE.MeshBasicMaterial({color:0xfff2d2,toneMapped:false,side:THREE.DoubleSide}));diffuser.rotation.x=-Math.PI/2;diffuser.position.y=-.475;pendant.add(diffuser);
  }
 });
 // Four deliberately composed social districts organize the open-plan common area.
 const socialZones=[
  {name:"CAFE & WELLNESS",x:-27.5,z:-.5,w:23,d:10.5,c:0xc99b61},
  {name:"QUIET LOUNGE",x:-36.5,z:11.2,w:10.5,d:13.5,c:0x69a9bd},
  {name:"GAME LOUNGE",x:-20.5,z:11,w:19,d:14,c:0x7d9cdd},
  {name:"SOCIAL HUB",x:20.5,z:8.5,w:25,d:18,c:0x6ac3b4}
 ];
 socialZones.forEach((z,i)=>{
  roundedSlab(THREE,scene,z.w,z.d,.10,.62,mat(THREE,0x344d58,{metalness:.38,roughness:.5}),z.x,-.004,z.z);
  const rugTones=[0xf0e4d4,0xdceaf0,0xe7e1f2,0xdceee8];
  roundedSlab(THREE,scene,z.w-.34,z.d-.34,.035,.48,mat(THREE,rugTones[i],{roughness:.78}),z.x,.09,z.z);
  const stripe=mat(THREE,z.c,{emissive:z.c,emissiveIntensity:.18,metalness:.32,roughness:.35});
  bx(THREE,scene,z.w-1,.035,.045,z.x,.14,z.z-z.d/2+.35,stripe,false);
  bx(THREE,scene,z.w-1,.035,.045,z.x,.14,z.z+z.d/2-.35,stripe,false);
  const glow=new THREE.PointLight(z.c,.3,18,2);glow.position.set(z.x,3.7,z.z);scene.add(glow);
  sign(THREE,scene,z.name,"SHARED SPACE  /  KANTOR AI",z.c,z.x,2.55,z.z-z.d/2+.1,Math.min(6.6,z.w*.42));
 });
 if(scene.fog){scene.fog.color.set(0xc8d8dc);scene.fog.near=175;scene.fog.far=340}
 const portrait=window.innerWidth/Math.max(1,window.innerHeight)<.85,target=new THREE.Vector3(0,1,-4.5),pos=portrait?new THREE.Vector3(52,62,-4.5):new THREE.Vector3(50,64,60);if(camera){camera.fov=portrait?67:43;camera.position.copy(pos);camera.updateProjectionMatrix()}if(controls){controls.target.copy(target);controls.update()}if(setTarget)setTarget({t:target.clone(),c:pos.clone()});
 const result={floor,pods:zones.length,meeting,reception:extras.reception,pantry:extras.pantry,tables:extras.tables,socialInteriors,workstations:Object.keys(rooms).filter(id=>!rooms[id]?.meet&&typeof rooms[id]?.id==='number').length,diagnostics:()=>({theme:"approved-isometric-open-office",workstationCount:Object.keys(rooms).filter(id=>!rooms[id]?.meet&&typeof rooms[id]?.id==='number').length,glassDivisionCount:zones.length,meetingRoomReady:!!meeting,receptionReady:true,pantryReady:true,collaborationTableCount:extras.tables.length,departmentDisplays:zones.length,socialCafeReady:!!socialInteriors?.cafe,quietLoungeReady:!!socialInteriors?.shelf})};scene.userData.isometricOfficeRebuild=result;return result
}
export function updateIsometricOffice(scene,dt){const r=scene?.userData?.isometricOfficeRebuild;if(!r)return;r.elapsed=(r.elapsed||0)+Math.min(.05,Math.max(0,dt||0))}
