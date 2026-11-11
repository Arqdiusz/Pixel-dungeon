'use strict';

function campEscape(){if(!S.campSession)return;let c=Math.min(5,S.p.sta);S.p.sta-=c;returnFromCamp('Ucieczka z obozu. Koszt: '+c+' STA.')}

function upgradeCamp(){let l=S.p.camp.level;if(fighting()||l>=3||S.p.gold<l*12)return;S.p.gold-=l*12;S.p.camp.level++;log('Obóz poziom '+S.p.camp.level,'heal');save();panel('camp')}

function followHorse32(){let a=hero(),h=S.p.horse;if(a.mounted||h.map!==S.map||h.fled&&fighting()||S.map==='_camp')return;if(h.fled&&!fighting())h.fled=false;if(Math.abs(h.x-a.x)+Math.abs(h.y-a.y)<=1)return;let q=[{x:h.x,y:h.y}],seen=new Set([h.x+','+h.y]);for(let j=0;j<q.length&&j<map().w*map().h;j++){let p=q[j];if(Math.abs(p.x-a.x)+Math.abs(p.y-a.y)<=1){if(p.first){h.x=p.first.x;h.y=p.first.y;}return;}for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let x=p.x+dx,y=p.y+dy,k=x+','+y;if(seen.has(k)||blocked(x,y)||occupied(x,y)||x===a.x&&y===a.y)continue;seen.add(k);q.push({x,y,first:p.first||{x,y}});}}}

function seenNow32(e){let a=replay?.actor||hero();return Math.max(Math.abs(e.x-a.x),Math.abs(e.y-a.y))<=6&&terrainSight(a,e)}

function known32(x,y){return !!S?.world?.explored?.[S.map]?.[y*map().w+x]}

function reveal32(){if(!S)return;S.world??={visited:{},known:{},interest:{}};S.world.explored??={};const m=map(),a=hero(),radius=(replay?.combat??fighting())?6:12;let arr=S.world.explored[S.map]??=Array(m.w*m.h).fill(0);for(let y=Math.max(0,a.y-radius);y<=Math.min(m.h-1,a.y+radius);y++)for(let x=Math.max(0,a.x-radius);x<=Math.min(m.w-1,a.x+radius);x++)if((x-a.x)**2+(y-a.y)**2<=radius*radius)arr[y*m.w+x]=1;}

function fog32(c){let m=map();for(let y=Math.max(0,Math.floor(cam.y/T));y<Math.min(m.h,Math.ceil((cam.y+innerHeight/cam.scale)/T));y++)for(let x=Math.max(0,Math.floor(cam.x/T));x<Math.min(m.w,Math.ceil((cam.x+innerWidth/cam.scale)/T));x++)if(!known32(x,y))rect(c,x*T,y*T,T,T,'#102119');hits=hits.filter(h=>known32(Math.floor(h.x/T),Math.floor(h.y/T)));}
