const zh = {
  brand: 'Snake Game',
  theme: '主题',
  language: '语言',
  score: '分数：',
  high_score: '最高：',
  settings: '设置',
  speed: '速度',
  speed_unit: '格/秒',
  board_size: '地图尺寸',
  wrap: '穿墙模式（关掉则撞墙即死）',
  obstacles: '随机障碍',
  sound: '音效',
  tips: '操作',
  tips_keyboard: '键盘：W/A/S/D 或 方向键',
  tips_mobile: '移动端：滑动方向或屏幕方向键',
  btn_start: '开始',
  btn_pause: '暂停',
  btn_reset: '重开',
  footer: '© 2025 Snake Game · 享受游戏吧！',
  game_over: '游戏结束',
  press_to_restart: '按 开始 或 空格 重开',
};

const en = {
  brand: 'Snake Game',
  theme: 'Theme',
  language: 'Language',
  score: 'Score: ',
  high_score: 'Best: ',
  settings: 'Settings',
  speed: 'Speed',
  speed_unit: 'cells/s',
  board_size: 'Board Size',
  wrap: 'Wrap-around (off = hit wall to die)',
  obstacles: 'Random Obstacles',
  sound: 'Sound',
  tips: 'Controls',
  tips_keyboard: 'Keyboard: W/A/S/D or Arrow Keys',
  tips_mobile: 'Mobile: Swipe or On-screen D-Pad',
  btn_start: 'Start',
  btn_pause: 'Pause',
  btn_reset: 'Restart',
  footer: '© 2025 Snake Game · Have fun!',
  game_over: 'Game Over',
  press_to_restart: 'Press Start or Space to restart',
};

export const messages = { zh, en };

export function createTranslator(lang){
  const dict = messages[lang] || messages.zh;
  return (key)=> dict[key] ?? key;
}