import { Game } from './modules/game.js';
import { setupUI } from './modules/ui.js';
import { Sound } from './modules/sound.js';
import { createTranslator } from './modules/i18n.js';

const root = document.documentElement;
const themeSelect = document.getElementById('themeSelect');
const langSelect = document.getElementById('languageSelect');

// 主题
root.setAttribute('data-theme', localStorage.getItem('snake_theme') || 'light');
if (themeSelect) themeSelect.value = root.getAttribute('data-theme');

themeSelect?.addEventListener('change', () => {
  const t = themeSelect.value;
  root.setAttribute('data-theme', t);
  localStorage.setItem('snake_theme', t);
});

// 语言
const currentLang = localStorage.getItem('snake_lang') || 'zh';
langSelect.value = currentLang;
let t = createTranslator(currentLang);
applyTexts();

globalThis.__setTitle = ()=>{ document.title = t('brand'); };
__setTitle();

langSelect.addEventListener('change', ()=>{
  const l = langSelect.value;
  localStorage.setItem('snake_lang', l);
  t = createTranslator(l);
  game.setTranslator(t);
  applyTexts();
  __setTitle();
  game.draw();
});

function applyTexts(){
  const $ = (id)=>document.getElementById(id);
  const map = [
    ['brandTitle','brand'],
    ['labelTheme','theme'],
    ['labelLanguage','language'],
    ['labelScore','score'],
    ['labelHighScore','high_score'],
    ['settingsTitle','settings'],
    ['speedLabel','speed'],
    ['speedUnit','speed_unit'],
    ['labelBoardSize','board_size'],
    ['labelWrapMode','wrap'],
    ['labelObstacles','obstacles'],
    ['labelSound','sound'],
    ['tipsTitle','tips'],
    ['tipsKeyboard','tips_keyboard'],
    ['tipsMobile','tips_mobile'],
    ['footerText','footer'],
  ];
  map.forEach(([id,key])=>{ const el=$(id); if(el) el.textContent = t(key); });
  const btnStart = $('btnStart'); const btnPause=$('btnPause'); const btnReset=$('btnReset');
  if(btnStart) btnStart.textContent = t('btn_start');
  if(btnPause) btnPause.textContent = t('btn_pause');
  if(btnReset) btnReset.textContent = t('btn_reset');
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sound = new Sound();

const game = new Game({
  ctx,
  gridSize: parseInt(document.getElementById('boardSize').value, 10) || 20,
  speed: parseInt(document.getElementById('speedRange').value, 10) || 10,
  wrap: document.getElementById('wrapMode').checked,
  obstacles: document.getElementById('obstacleToggle').checked,
  t,
  initialLength: 8,
  onScore: (s)=>{
    document.getElementById('score').textContent = s.toString();
    const hs = Math.max(s, parseInt(localStorage.getItem('snake_highscore')||'0',10));
    localStorage.setItem('snake_highscore', hs.toString());
    document.getElementById('highScore').textContent = hs.toString();
    if (document.getElementById('soundToggle').checked) sound.eat();
  },
  onGameOver: ()=>{
    if (document.getElementById('soundToggle').checked) sound.hit();
  }
});

document.getElementById('highScore').textContent = (localStorage.getItem('snake_highscore')||'0');

// UI + 事件
setupUI({ game, canvas, sound });

// 初始渲染
game.draw();