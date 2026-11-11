'use strict';

function drawLandscape(){if(!titleActive)return;let cv=$('titleLandscape');cv.width=640;cv.height=360;landscapeScene(cv.getContext('2d'),landscape);$('landscapeName').textContent=LANDSCAPES[landscape];for(let b of $('landscapeDots').children)b.setAttribute('aria-pressed',String(+b.dataset.index===landscape))}

function hit(x,y){let wx=x/cam.scale+Math.round(cam.x),wy=y/cam.scale+Math.round(cam.y);return[...hits].reverse().find(h=>wx>=h.x&&wx<h.x+T&&wy>=h.y&&wy<h.y+T)}

function loop(now){if(active()&&!busy&&!$('dialog').open){if(!fighting()&&heldDirection&&now-lastStep>=155){lastStep=now;move(...heldDirection)}if(!fighting()&&now-lastWorld>=850){lastWorld=now;worldTick()}if(motions.size)draw()}requestAnimationFrame(loop)}
