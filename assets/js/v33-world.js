'use strict';

function expandRegion33(m){
 if(!m||m.layout33)return;const ow=m.w,oh=m.h;if(ow!==32||oh!==24)return;
 m.w=ow*2;m.h=oh*2;m.layout33=true;m.previousSize33={w:ow,h:oh};
 for(const e of m.exits){if(e.x===ow-2)e.x=m.w-2;if(e.y===oh-2)e.y=m.h-2;if(e.tx===ow-3)e.tx=m.w-3;if(e.ty===oh-2)e.ty=m.h-2;if(e.ty===oh-3)e.ty=m.h-3;}
 function overlap(x,y,w=1,h=1){return m.obstacles.some(o=>x<o.x+(o.w||1)&&x+w>o.x&&y<o.y+(o.h||1)&&y+h>o.y)||m.npcs.some(n=>n.x>=x&&n.x<x+w&&n.y>=y&&n.y<y+h)||m.enemies.some(n=>n.x>=x&&n.x<x+w&&n.y>=y&&n.y<y+h);}
 if(m.name==='Wioska Brzeziny')for(const [x,y,w,h] of [[36,5,4,3],[46,5,5,3],[55,18,4,3],[24,28,4,3],[7,30,4,3],[37,33,5,4],[49,35,4,3],[6,40,4,3]])if(!overlap(x,y,w,h))m.obstacles.push({x,y,w,h,type:'house'});
 for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++){if(x<ow&&y<oh||y>=9&&y<=15||x>=13&&x<=19||m.exits.some(e=>Math.abs(e.x-x)+Math.abs(e.y-y)<5)||overlap(x,y))continue;const n=hash(x,y,m.name.length),rate=m.name==='Wioska Brzeziny'?43:m.name.includes('Las')||m.name.includes('Leś')?13:29;if(n%rate===0)m.obstacles.push({x,y,type:n%7===0?'rock':'tree'});}
}

function upgradeState33(st){if(!st?.maps)return;for(const [id,m] of Object.entries(st.maps)){const ow=m.w,oh=m.h;if(ow!==32||oh!==24||m.layout33)continue;const discovered=st.world?.explored?.[id];expandRegion33(m);if(discovered){const bigger=Array(m.w*m.h).fill(0);for(let y=0;y<oh;y++)for(let x=0;x<ow;x++)if(discovered[y*ow+x])bigger[y*m.w+x]=1;st.world.explored[id]=bigger;}}st.revision33=33;}

function exitCells33(e,m=map()){const horizontal=e.x<=2||e.x>=m.w-3,vertical=e.y<=2||e.y>=m.h-3,cells=[];for(let d=-1;d<=1;d++){const x=e.x+(horizontal?0:vertical?d:0),y=e.y+(horizontal?d:0);if(x>=1&&x<=m.w-2&&y>=1&&y<=m.h-2&&!cells.some(p=>p.x===x&&p.y===y))cells.push({x,y});}return cells;}

function exitContains33(e,x,y){return exitCells33(e).some(p=>p.x===x&&p.y===y);}
