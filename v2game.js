
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x87ceeb);
scene.fog=new THREE.Fog(0x87ceeb,20,120);

const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);

const light=new THREE.DirectionalLight(0xffffff,1.2);
light.position.set(20,40,20);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff,.45));

const ground=new THREE.Mesh(
new THREE.PlaneGeometry(300,300),
new THREE.MeshStandardMaterial({color:0x355e2b})
);
ground.rotation.x=-Math.PI/2;
scene.add(ground);

const player=new THREE.Mesh(
new THREE.BoxGeometry(1,2,1),
new THREE.MeshStandardMaterial({color:0x0000ff})
);
player.position.y=1;
scene.add(player);

camera.position.set(0,4,8);

for(let i=0;i<40;i++){
const h=Math.random()*12+4;
const b=new THREE.Mesh(
new THREE.BoxGeometry(Math.random()*6+3,h,Math.random()*6+3),
new THREE.MeshStandardMaterial({color:0x777777})
);
b.position.set((Math.random()-.5)*200,h/2,(Math.random()-.5)*200);
scene.add(b);
}

const cap=new THREE.Mesh(
new THREE.CylinderGeometry(4,4,.4,32),
new THREE.MeshStandardMaterial({color:0xffff00})
);
cap.position.set(0,.2,-30);
scene.add(cap);

let health=100,ammo=30,blue=0,red=0;
const controls={up:false,down:false,left:false,right:false};

function bind(id,key){
const e=document.getElementById(id);
e.addEventListener('touchstart',()=>controls[key]=true);
e.addEventListener('touchend',()=>controls[key]=false);
e.addEventListener('mousedown',()=>controls[key]=true);
e.addEventListener('mouseup',()=>controls[key]=false);
}

bind('up','up');bind('down','down');bind('left','left');bind('right','right');

const enemies=[];
function spawnEnemy(x,z){
const e=new THREE.Mesh(
new THREE.BoxGeometry(1,2,1),
new THREE.MeshStandardMaterial({color:0xff0000})
);
e.position.set(x,1,z);
e.health=100;
scene.add(e);
enemies.push(e);
}

for(let i=0;i<15;i++)spawnEnemy((Math.random()-.5)*80,(Math.random()-.5)*80);

const bullets=[];
function shoot(){
if(ammo<=0)return;
ammo--;
const b=new THREE.Mesh(
new THREE.SphereGeometry(.15,8,8),
new THREE.MeshBasicMaterial({color:0xffffaa})
);
b.position.copy(player.position);
const d=new THREE.Vector3();
camera.getWorldDirection(d);
b.velocity=d.multiplyScalar(1.5);
scene.add(b);
bullets.push(b);
}
document.getElementById('shoot').addEventListener('click',shoot);
document.getElementById('shoot').addEventListener('touchstart',shoot);
document.getElementById('reload').addEventListener('click',()=>ammo=30);

function hud(){
document.getElementById('score').innerText=`Blue: ${Math.floor(blue)} | Red: ${Math.floor(red)}`;
document.getElementById('health').innerText=`Health: ${Math.floor(health)}`;
document.getElementById('ammo').innerText=`Ammo: ${ammo}`;
}

function animate(){
requestAnimationFrame(animate);
const speed=.22;
if(controls.up)player.position.z-=speed;
if(controls.down)player.position.z+=speed;
if(controls.left)player.position.x-=speed;
if(controls.right)player.position.x+=speed;

camera.position.x+=(player.position.x-camera.position.x)*.08;
camera.position.z+=((player.position.z+8)-camera.position.z)*.08;
camera.lookAt(player.position);

for(let enemy of enemies){
const dir=new THREE.Vector3().subVectors(player.position,enemy.position).normalize();
enemy.position.add(dir.multiplyScalar(.05));
if(enemy.position.distanceTo(player.position)<1.5){
health-=.08;
if(health<=0){alert('Mission Failed');location.reload();}
}
}

for(let i=bullets.length-1;i>=0;i--){
const bullet=bullets[i];
bullet.position.add(bullet.velocity);
for(let j=enemies.length-1;j>=0;j--){
const enemy=enemies[j];
if(bullet.position.distanceTo(enemy.position)<1){
enemy.health-=50;
scene.remove(bullet);
bullets.splice(i,1);
if(enemy.health<=0){
scene.remove(enemy);
enemies.splice(j,1);
blue+=15;
}
break;
}
}
}

if(player.position.distanceTo(cap.position)<5){
blue+=.08;
cap.material.color.set(0x00aaff);
}else{
red+=.04;
cap.material.color.set(0xffff00);
}

if(enemies.length<10)spawnEnemy((Math.random()-.5)*80,(Math.random()-.5)*80);

hud();
renderer.render(scene,camera);
}
animate();

window.addEventListener('resize',()=>{
camera.aspect=window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth,window.innerHeight);
});
