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
 bx(T,group,.85,.06,.28,-.48,1,-.18,m.keyboard);bx(T,group,.22,.06,.26,.55,1,-.18,m.mouse);
 bx(T,group,.3,.38,.26,-1.12,1.13,-.34,m.tower);
 for(let i=0;i<4;i++)bx(T,group,.018,.2,.012,-1.22+i*.045,1.14,-.195,accent,false);
 // Ergonomic chair: rounded cushion, backrest, central post and five spokes.
 roundedSlab(T,group,.92,.86,.15,.2,m.seat,0,.78,1);
 const backrest=new T.Mesh(new T.BoxGeometry(.86,.86,.16),m.seat);backrest.position.set(0,1.24,1.36);backrest.rotation.x=-.13;backrest.castShadow=true;group.add(backrest);
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
 const m={wood:mat(THREE,0x9a7550),metal:mat(THREE,0x3d5057,{metalness:.55}),frame:mat(THREE,0x273a43,{metalness:.5}),seat:mat(THREE,0x47677b),keyboard:mat(THREE,0x25343a),mouse:mat(THREE,0x303a40),tower:mat(THREE,0x35454c),lightDesk:mat(THREE,0xe5ebe9),accent:mat(THREE,0x65c6cf)};
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
 // Soft architectural fill lights and division-specific ceiling rafts give the glass pods depth.
 const fillA=new THREE.DirectionalLight(0xe4f5ff,.48);fillA.position.set(-38,34,-8);scene.add(fillA);
 const fillB=new THREE.DirectionalLight(0xffe5c6,.24);fillB.position.set(24,30,22);scene.add(fillB);
 const socialGlow=new THREE.PointLight(0x72d4e2,.55,48,2);socialGlow.position.set(-4,5,8);scene.add(socialGlow);
 zones.forEach(z=>{
  const [a,b,c,d]=z.box,w=b-a,depth=d-c,cx=(a+b)/2,cz=(c+d)/2,col=styles[z.id]?.[0]||0x65c6cf;
  const dark=mat(THREE,0x263e49,{metalness:.55,roughness:.35}),light=mat(THREE,col,{emissive:col,emissiveIntensity:.65,metalness:.3,roughness:.28});
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
 const portrait=window.innerWidth/Math.max(1,window.innerHeight)<.85,target=new THREE.Vector3(0,1,-4.5),pos=portrait?new THREE.Vector3(52,62,-4.5):new THREE.Vector3(55,69,66);if(camera){camera.fov=portrait?67:43;camera.position.copy(pos);camera.updateProjectionMatrix()}if(controls){controls.target.copy(target);controls.update()}if(setTarget)setTarget({t:target.clone(),c:pos.clone()});
 const result={floor,pods:zones.length,meeting,reception:extras.reception,pantry:extras.pantry,tables:extras.tables,workstations:Object.keys(rooms).filter(id=>!rooms[id]?.meet&&typeof rooms[id]?.id==='number').length,diagnostics:()=>({theme:"approved-isometric-open-office",workstationCount:Object.keys(rooms).filter(id=>!rooms[id]?.meet&&typeof rooms[id]?.id==='number').length,glassDivisionCount:zones.length,meetingRoomReady:!!meeting,receptionReady:true,pantryReady:true,collaborationTableCount:extras.tables.length})};scene.userData.isometricOfficeRebuild=result;return result
}
export function updateIsometricOffice(scene,dt){const r=scene?.userData?.isometricOfficeRebuild;if(!r)return;r.elapsed=(r.elapsed||0)+Math.min(.05,Math.max(0,dt||0))}
