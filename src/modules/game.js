export class Game{
  constructor({ctx, gridSize=20, speed=10, wrap=true, obstacles=false, onScore=()=>{}, onGameOver=()=>{}, t=(k)=>k, initialLength=6}){
    this.ctx = ctx;
    this.wrap = wrap;
    this.gridSize = gridSize; // N x N
    this.speed = speed; // cells per second
    this.cellPx = 26; // canvas model size will be grid*cell
    this.onScore = onScore;
    this.onGameOver = onGameOver;
    this.t = t;
    this.initialLength = initialLength;

    this.state = 'idle'; // idle | running | paused | over
    this.tickMs = 1000/this.speed;

    this.dir = {x:1,y:0};
    this.nextDir = {x:1,y:0};

    // 初始更长的蛇身
    this.snake = Array.from({length:this.initialLength}, (_,i)=>({x:this.initialLength-1-i,y:2}));
    this.food = this._randEmptyCell();

    this.obstaclesEnabled = obstacles;
    this.obstacles = [];
    if (this.obstaclesEnabled) this._spawnObstacles();

    this.lastStep = 0;
    this.score = 0;

    // setup canvas size model
    this._resizeCanvas();
    window.addEventListener('resize', ()=> this._resizeCanvas());

    // keyboard
    window.addEventListener('keydown', (e)=>{
      const key = e.key.toLowerCase();
      if(['arrowup','w'].includes(key)) this.setDirection(0,-1);
      if(['arrowdown','s'].includes(key)) this.setDirection(0,1);
      if(['arrowleft','a'].includes(key)) this.setDirection(-1,0);
      if(['arrowright','d'].includes(key)) this.setDirection(1,0);
      if(key===' '){ this.togglePause(); }
    });
  }

  setTranslator(fn){ this.t = typeof fn === 'function' ? fn : (k)=>k; }

  _resizeCanvas(){
    const canvas = this.ctx.canvas;
    const parent = canvas.parentElement;
    const parentW = parent?.clientWidth || window.innerWidth;
    const padding = 32; // 近似扣除容器内边距
    const avail = Math.max(0, Math.floor(parentW - padding));

    const MAX_W = 520; // 比之前更窄
    const MIN_W = 280; // 允许更小以适配小屏

    const dpr = window.devicePixelRatio || 1;
    const px = Math.min(MAX_W, Math.max(MIN_W, avail));
    const cellPx = Math.floor(px / this.gridSize);
    this.cellPx = Math.max(12, Math.min(36, cellPx)); // 上限略降，整体更紧凑

    const w = this.gridSize * this.cellPx;
    const h = w; // 方形画布
    canvas.width = Math.floor(w*dpr);
    canvas.height = Math.floor(h*dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  setGridSize(n){
    this.gridSize = n;
    this.reset();
    this._resizeCanvas();
  }

  setSpeed(s){
    this.speed = s; this.tickMs = 1000/s;
  }

  setWrap(wrap){
    this.wrap = wrap;
  }

  setObstacles(on){
    this.obstaclesEnabled = on;
    this._spawnObstacles();
    this.draw();
  }

  _spawnObstacles(){
    this.obstacles = [];
    if(!this.obstaclesEnabled) return;
    const count = Math.floor(this.gridSize * 0.6);
    for(let i=0;i<count;i++){
      const cell = this._randEmptyCell();
      if(!this._collides(cell, this.snake) && !(cell.x===this.food?.x && cell.y===this.food?.y)){
        this.obstacles.push(cell);
      }
    }
  }

  // 兼容不支持 roundRect 的环境
  _roundRectPath(c, x, y, w, h, r){
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    c.moveTo(x + rr, y);
    c.lineTo(x + w - rr, y);
    c.arcTo(x + w, y, x + w, y + rr, rr);
    c.lineTo(x + w, y + h - rr);
    c.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    c.lineTo(x + rr, y + h);
    c.arcTo(x, y + h, x, y + h - rr, rr);
    c.lineTo(x, y + rr);
    c.arcTo(x, y, x + rr, y, rr);
  }

  _randEmptyCell(){
    const pos = {x: Math.floor(Math.random()*this.gridSize), y: Math.floor(Math.random()*this.gridSize)};
    return pos;
  }

  setDirection(x,y){
    // prevent reverse
    if(this.dir.x + x === 0 && this.dir.y + y === 0) return;
    this.nextDir = {x,y};
  }

  start(){
    if(this.state==='running') return;
    if(this.state==='over') this.reset();
    this.state = 'running';
    this.lastStep = performance.now();
    this._loop();
  }

  pause(){ this.state = 'paused'; }
  resume(){ if(this.state!=='running'){ this.state='running'; this.lastStep = performance.now(); this._loop(); } }
  togglePause(){ this.state==='running'?this.pause():this.resume(); }

  reset(){
    this.state = 'idle';
    this.dir = {x:1,y:0}; this.nextDir = {x:1,y:0};
    this.snake = Array.from({length:this.initialLength}, (_,i)=>({x:this.initialLength-1-i,y:2}));
    this.food = this._randEmptyCell();
    this._spawnObstacles();
    this.score = 0;
  }

  _loop(){
    if(this.state !== 'running') return;
    const now = performance.now();
    const dt = now - this.lastStep;
    if(dt >= this.tickMs){
      this.lastStep = now;
      this.step();
    }
    this.draw();
    requestAnimationFrame(()=>this._loop());
  }

  step(){
    this.dir = this.nextDir;
    const head = {x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y};

    if(this.wrap){
      head.x = (head.x + this.gridSize) % this.gridSize;
      head.y = (head.y + this.gridSize) % this.gridSize;
    }

    // collisions
    if(!this.wrap && (head.x<0 || head.x>=this.gridSize || head.y<0 || head.y>=this.gridSize)){
      return this.gameOver();
    }
    if(this._collides(head, this.snake)) return this.gameOver();
    if(this.obstaclesEnabled && this._collides(head, this.obstacles)) return this.gameOver();

    this.snake.unshift(head);

    if(this.food && head.x===this.food.x && head.y===this.food.y){
      this.score += 1; this.onScore(this.score);
      this.food = this._randEmptyCell();
      // dynamic difficulty: speed up slightly every 5 points
      if(this.score % 5 === 0){ this.setSpeed(Math.min(25, this.speed + 1)); }
    }else{
      this.snake.pop();
    }
  }

  _collides(cell, list){
    return list.some(p=>p.x===cell.x && p.y===cell.y);
  }

  gameOver(){
    this.state = 'over';
    this.onGameOver();
  }

  draw(){
    const c = this.ctx;
    const N = this.gridSize;
    const cell = this.cellPx;
    c.clearRect(0,0,c.canvas.width,c.canvas.height);

    // board grid subtle
    c.save();
    c.globalAlpha = 0.6;
    c.strokeStyle = 'rgba(100,116,139,0.25)';
    c.lineWidth = 1;
    for(let i=0;i<=N;i++){
      c.beginPath(); c.moveTo(i*cell, 0); c.lineTo(i*cell, N*cell); c.stroke();
      c.beginPath(); c.moveTo(0, i*cell); c.lineTo(N*cell, i*cell); c.stroke();
    }
    c.restore();

    // obstacles
    if(this.obstaclesEnabled){
      c.fillStyle = 'rgba(2,132,199,0.8)';
      this.obstacles.forEach(p=>{
        const rx = p.x*cell+2, ry = p.y*cell+2, rw = cell-4, rh = cell-4, rr = 6;
        c.beginPath();
        if (typeof c.roundRect === 'function') {
          c.roundRect(rx, ry, rw, rh, rr);
        } else {
          this._roundRectPath(c, rx, ry, rw, rh, rr);
        }
        c.fill();
      });
    }

    // snake
    const headColor = '#22d3ee';
    const bodyColor = '#34d399';
    this.snake.forEach((p,i)=>{
      c.fillStyle = i===0?headColor:bodyColor;
      const rx = p.x*cell+2, ry = p.y*cell+2, rw = cell-4, rh = cell-4, rr = i===0?8:6;
      c.beginPath();
      if (typeof c.roundRect === 'function') {
        c.roundRect(rx, ry, rw, rh, rr);
      } else {
        this._roundRectPath(c, rx, ry, rw, rh, rr);
      }
      c.fill();
    });

    // 蛇头眼睛
    if(this.snake.length){
      const h = this.snake[0];
      const ex = (ox)=> h.x*cell + ox*cell;
      const ey = (oy)=> h.y*cell + oy*cell;
      let p1, p2;
      if(this.dir.x === 1){
        p1 = {x: ex(0.62), y: ey(0.35)}; p2 = {x: ex(0.62), y: ey(0.65)};
      }else if(this.dir.x === -1){
        p1 = {x: ex(0.38), y: ey(0.35)}; p2 = {x: ex(0.38), y: ey(0.65)};
      }else if(this.dir.y === 1){
        p1 = {x: ex(0.35), y: ey(0.62)}; p2 = {x: ex(0.65), y: ey(0.62)};
      }else{ // up
        p1 = {x: ex(0.35), y: ey(0.38)}; p2 = {x: ex(0.65), y: ey(0.38)};
      }
      const r1 = cell*0.12, r2 = cell*0.06;
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(p1.x, p1.y, r1, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(p2.x, p2.y, r1, 0, Math.PI*2); c.fill();
      c.fillStyle = '#111';
      c.beginPath(); c.arc(p1.x, p1.y, r2, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(p2.x, p2.y, r2, 0, Math.PI*2); c.fill();
    }

    if(this.state==='over'){
      c.save();
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.fillRect(0,0,N*cell,N*cell);
      c.fillStyle = '#fff';
      c.font = 'bold 32px ui-sans-serif, system-ui';
      c.textAlign='center';
      c.fillText(this.t('game_over'), N*cell/2, N*cell/2 - 10);
      c.font = '16px ui-sans-serif, system-ui';
      c.fillText(this.t('press_to_restart'), N*cell/2, N*cell/2 + 18);
      c.restore();
    }
  }
}