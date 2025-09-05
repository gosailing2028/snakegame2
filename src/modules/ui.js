export function setupUI({ game, canvas, sound }){
  const q = (id)=>document.getElementById(id);
  const btnStart = q('btnStart');
  const btnPause = q('btnPause');
  const btnReset = q('btnReset');
  const speedRange = q('speedRange');
  const speedVal = q('speedVal');
  const boardSize = q('boardSize');
  const wrapMode = q('wrapMode');
  const obstacleToggle = q('obstacleToggle');
  const soundToggle = q('soundToggle');
  const dpad = document.getElementById('mobileControls');

  btnStart.addEventListener('click', ()=>{
    if(game.state==='over' || game.state==='idle') game.reset();
    game.start();
  });
  btnPause.addEventListener('click', ()=> game.togglePause());
  btnReset.addEventListener('click', ()=>{ game.reset(); game.draw(); });

  speedVal.textContent = speedRange.value;
  speedRange.addEventListener('input', ()=>{ speedVal.textContent = speedRange.value; game.setSpeed(parseInt(speedRange.value,10)); });

  boardSize.addEventListener('change', ()=>{
    const n = parseInt(boardSize.value,10);
    game.setGridSize(n);
    game.draw();
  });
  wrapMode.addEventListener('change', ()=> game.setWrap(wrapMode.checked));
  obstacleToggle.addEventListener('change', ()=> game.setObstacles(obstacleToggle.checked));
  soundToggle.addEventListener('change', ()=>{
    // no-op: read when play
  });

  // Mobile swipe
  let touchStart=null;
  canvas.addEventListener('touchstart', (e)=>{
    const t=e.touches[0];
    touchStart={x:t.clientX,y:t.clientY};
  }, {passive:true});
  canvas.addEventListener('touchmove', (e)=>{
    if(!touchStart) return; const t=e.touches[0];
    const dx=t.clientX-touchStart.x; const dy=t.clientY-touchStart.y;
    if(Math.abs(dx)+Math.abs(dy) > 24){
      if(Math.abs(dx)>Math.abs(dy)) game.setDirection(Math.sign(dx),0); else game.setDirection(0,Math.sign(dy));
      touchStart=null;
    }
  }, {passive:true});
  canvas.addEventListener('touchend', ()=> touchStart=null);

  // D-Pad buttons
  dpad.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-dir]');
    if(!btn) return; const dir = btn.dataset.dir;
    if(dir==='up') game.setDirection(0,-1);
    if(dir==='down') game.setDirection(0,1);
    if(dir==='left') game.setDirection(-1,0);
    if(dir==='right') game.setDirection(1,0);
  });
}