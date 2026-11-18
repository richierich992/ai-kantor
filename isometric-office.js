/* Mockup-aligned isometric office. Visual-only; preserves agent rooms, Firebase paths and work flows. */
const styles={finance:[0x4d9b73,0xe8f1e9,"FINANCE"],marketing_content:[0xd16d8d,0xf7e9ee,"MARKETING & CONTENT"],it_automation:[0x4a9ab6,0xe8f1f6,"IT & AUTOMATION"],research_intelligence:[0x638dc1,0xe9edf6,"RESEARCH"],hr_admin:[0x9378b7,0xf0eaf4,"HR & ADMIN"]};
const mat=(T,c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.7,...o});
function bx(T,p,w,h,d,x,y,z,m,sh=true){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=sh;p.add(o);return o}
function cyl(T,p,r,h,x,y,z,m){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
function sign(T,p,title,sub,color,x,y,z,w=4.8){const c=document.createElement('canvas');c.width=768;c.height=144;const q=c.getContext('2d');q.fillStyle='#132938';q.fillRect(0,0,768,144);q.fillStyle='#'+new T.Color(color).getHexString();q.fillRect(0,0,9,144);q.font='900 30px system-ui';q.fillStyle='#f4fbff';q.fillText(title,34,58,700);q.font='700 18px system-ui';q.fillStyle='#b0c3ce';q.fillText(sub,36,108,700);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,w*.19),new T.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,side:T.DoubleSide}));m.position.set(x,y,z);p.add(m)}
function tile(T){const c=document.createElement('canvas');c.width=c.height=512;const q=c.getContext('2d');q.fillStyle='#e5e9e8';q.fillRect(0,0,512,512);for(let y=0;y<8;y++)for(let x=0;x<8;x++){q.fillStyle=(x+y)%2?'#e9eeed':'#dfe6e5';q.fillRect(x*64+2,y*64+2,60,60);q.strokeStyle='#bcc8c8';q.strokeRect(x*64+1,y*64+1,62,62)}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(8,4);return t}
function glassZone(T,scene,z){const [a,b,c,d]=z.box,w=b-a,depth=d-c,cx=(a+b)/2,cz=(c+d)/2,h=3.25,style=styles[z.id]||styles.finance,frame=mat(T,0x435660,{metalness:.55,roughness:.38}),glass=new T.MeshPhysicalMaterial({color:0xb4cbd8,transparent:true,opacity:.14,roughness:.18,side:T.DoubleSide,depthWrite:false});
 const carpet=new T.Mesh(new T.PlaneGeometry(w-.3,depth-.3),mat(T,style[1],{roughness:.92}));carpet.rotation.x=-Math.PI/2;carpet.position.set(cx,.015,cz);scene.add(carpet);
 const back=bx(T,scene,w,h,.06,cx,h/2,c,glass,false);back.renderOrder=2;[a,b].forEach(x=>{const side=bx(T,scene,.06,h,depth,x,h/2,cz,glass,false);side.renderOrder=2});
 const gap=Math.min(3.2,w-1),seg=(w-gap)/2;[a+seg/2,b-seg/2].forEach(x=>{const p=bx(T,scene,seg,h,.06,x,h/2,d,glass,false);p.renderOrder=2});
 [[a,c],[b,c],[a,d],[b,d]].forEach(([x,z])=>bx(T,scene,.11,h+.06,.12,x,h/2,z,frame,false));bx(T,scene,w,.12,.14,cx,h+.03,c,frame,false);bx(T,scene,w,.12,.14,cx,h+.03,d,frame,false);bx(T,scene,w-.2,.05,.09,cx,.14,d-.04,mat(T,style[0],{emissive:style[0],emissiveIntensity:.12}),false);const count=Math.max(1,Math.floor(depth/5));for(let i=1;i<count;i++){const z=c+depth/count*i;bx(T,scene,.07,h,.1,a+.03,h/2,z,frame,false);bx(T,scene,.07,h,.1,b-.03,h/2,z,frame,false)}
 sign(T,scene,style[2],"GLASS TEAM WORKSPACE",style[0],cx,3,d+.05,Math.min(6.2,Math.max(3.8,w*.3)));return carpet}
function workstation(T,r,m){const g=r.g,group=new T.Group();group.name="mockup-workstation-"+r.id;g.userData.isMockupFurniture=true;group.position.set(0,0,0);r.g.add(group);
 bx(T,group,3.1,.14,1.5,0,.88,-.45,m.wood);[-1.4,1.4].forEach(x=>[-1,.05].forEach(z=>bx(T,group,.09,.78,.09,x,.4,z,m.metal)));
 bx(T,group,1.48,1,.12,-.48,1.55,-1.1,m.frame);if(r.screenMesh)r.screenMesh.visible=false;
 const mainScreen=new T.Mesh(new T.PlaneGeometry(1.35,.78),new T.MeshBasicMaterial({map:r.tx,toneMapped:false,side:T.DoubleSide}));mainScreen.position.set(-.48,1.55,-1.025);mainScreen.renderOrder=5;group.add(mainScreen);
 const telemetry=g.children.find(o=>o.userData?.phase8Monitor);if(telemetry){telemetry.visible=true;telemetry.position.set(.72,1.46,-1.1);telemetry.rotation.set(0,0,0);telemetry.scale.set(1,1,1);telemetry.renderOrder=5}
 bx(T,group,.85,.06,.28,-.48,1,-.18,m.keyboard);bx(T,group,.22,.06,.26,.55,1,-.18,m.mouse);bx(T,group,.3,.38,.26,-1.12,1.13,-.34,m.tower);
 bx(T,group,.9,.14,.86,0,.78,1,m.seat);bx(T,group,.85,.85,.14,0,1.22,1.35,m.seat);bx(T,group,.1,.38,.1,0,.32,1,m.metal);
 r.spot=g.localToWorld(new T.Vector3(0,0,1.55));r.inside=g.localToWorld(new T.Vector3(0,0,1.72));r.front=g.localToWorld(new T.Vector3(0,0,3.35));r.row=g.position.z<-17?'A':'B';r.isometricWorkstation=true}
function createOfficeExtras(T,scene,m){
 const reception=new T.Group();reception.name="mockup-reception";reception.position.set(0,0,14.7);scene.add(reception);bx(T,reception,5.5,.95,1.45,0,.55,0,m.frame);bx(T,reception,5.8,.14,1.58,0,1.08,0,m.lightDesk);bx(T,reception,4.6,.06,.08,0,.55,.75,m.accent);sign(T,reception,"RECEPTION","WELCOME TO KANTOR AI",0x62cbd0,0,2.35,-.4,5.6);
 const pantry=new T.Group();pantry.name="mockup-pantry";pantry.position.set(31,0,12.5);scene.add(pantry);bx(T,pantry,4.8,.95,1.15,0,.55,0,m.frame);bx(T,pantry,5.1,.14,1.3,0,1.08,0,m.lightDesk);[-1.4,0,1.4].forEach(x=>{cyl(T,pantry,.12,.8,x,.4,1,m.metal);cyl(T,pantry,.35,.12,x,.85,1,m.seat)});sign(T,pantry,"PANTRY","COFFEE • BREAK • REFRESH",0xd59e62,0,2.45,-.65,4.9);
 const tables=[];[[-8,2],[5,2],[-8,9],[5,9]].forEach(([x,z],i)=>{const g=new T.Group();g.name="mockup-collab-table-"+i;g.position.set(x,0,z);scene.add(g);bx(T,g,3.8,.14,1.8,0,.85,0,m.wood);[-1.7,1.7].forEach(dx=>[-.7,.7].forEach(dz=>bx(T,g,.1,.8,.1,dx,.4,dz,m.metal)));[-1,1].forEach(s=>bx(T,g,.8,.85,.8,s*2.4,.4,0,m.seat));tables.push(g)});
 const greenery=mat(T,0x4a956a),pot=mat(T,0x776957);[[-10,-24],[12,-24],[-10,-8],[13,-8],[7,12],[-10,12]].forEach(([x,z])=>{bx(T,scene,2.1,.45,1,x,.22,z,pot);const plant=new T.Mesh(new T.IcosahedronGeometry(.5,1),greenery);plant.position.set(x,.9,z);plant.scale.set(1.15,.9,.9);scene.add(plant)});
 [-30,-17,-2,15,32].forEach(x=>[-16,-5,8].forEach(z=>bx(T,scene,3.4,.09,.4,x,4.15,z,m.light,false)));
 return {reception,pantry,tables}
}
export function enhanceIsometricOffice({THREE,scene,rooms,characters,zones=[],zoneMeshes=[],camera,controls,setTarget}){
 if(scene.userData.isometricOfficeRebuild)return scene.userData.isometricOfficeRebuild;
 const m={wood:mat(THREE,0x9a7550),metal:mat(THREE,0x3d5057,{metalness:.55}),frame:mat(THREE,0x273a43,{metalness:.5}),seat:mat(THREE,0x47677b),keyboard:mat(THREE,0x25343a),mouse:mat(THREE,0x303a40),tower:mat(THREE,0x35454c),lightDesk:mat(THREE,0xe5ebe9),accent:mat(THREE,0x65c6cf)};
 const floorMat=mat(THREE,0xffffff,{map:tile(),roughness:.9});bx(THREE,scene,88,.55,47,0,-.32,-4.5,mat(THREE,0x46535a));const floor=new THREE.Mesh(new THREE.PlaneGeometry(84,43),floorMat);floor.rotation.x=-Math.PI/2;floor.position.set(0,-.02,-4.5);floor.receiveShadow=true;scene.add(floor);
 // Retire the old campus/yard render layers, preserving characters, rooms and Social Hub props.
 if(scene.userData.premiumWorldPhase2Root)scene.userData.premiumWorldPhase2Root.visible=false;
 if(scene.userData.premiumExperiencePhase7?.decorRoot)scene.userData.premiumExperiencePhase7.decorRoot.visible=false;
 scene.traverse(o=>{
  const p=o.geometry?.parameters;
  if(!o.isMesh||!p)return;
  const bg=o.geometry.type==="BoxGeometry",pg=o.geometry.type==="PlaneGeometry";
  if(bg&&((p.width===420&&p.depth===300)||(p.width===88&&p.height===.7&&p.depth===47)))o.visible=false;
  if(pg&&((p.width===16&&p.height===8)||(p.width===280&&p.height===12)||(p.width===84&&p.height===43)))o.visible=false;
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
 const extras=createOfficeExtras(THREE,scene,m);scene.background=new THREE.Color(0xb6c7cc);if(scene.fog){scene.fog.color.set(0xc6d4d5);scene.fog.near=150;scene.fog.far=310}
 const portrait=window.innerWidth/Math.max(1,window.innerHeight)<.85,target=new THREE.Vector3(0,1,-4.5),pos=portrait?new THREE.Vector3(15,84,116):new THREE.Vector3(49,61,59);if(camera){camera.fov=portrait?68:43;camera.position.copy(pos);camera.updateProjectionMatrix()}if(controls){controls.target.copy(target);controls.update()}if(setTarget)setTarget({t:target.clone(),c:pos.clone()});
 const result={floor,pods:zones.length,meeting,reception:extras.reception,pantry:extras.pantry,tables:extras.tables,workstations:Object.keys(rooms).filter(id=>!rooms[id]?.meet&&typeof rooms[id]?.id==='number').length,diagnostics:()=>({theme:"approved-isometric-open-office",workstationCount:Object.keys(rooms).filter(id=>!rooms[id]?.meet&&typeof rooms[id]?.id==='number').length,glassDivisionCount:zones.length,meetingRoomReady:!!meeting,receptionReady:true,pantryReady:true,collaborationTableCount:extras.tables.length})};scene.userData.isometricOfficeRebuild=result;return result
}
export function updateIsometricOffice(scene,dt){const r=scene?.userData?.isometricOfficeRebuild;if(!r)return;r.elapsed=(r.elapsed||0)+Math.min(.05,Math.max(0,dt||0))}
