var ctx: any = null;

var hero = new PlayerSprite("/img/hero.png");

var lastUpdate = Date.now();

let initialize = function () {
  var canvas: any = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
  reset();
  gameLoop();
};

let reset = function () {
  hero.reset();
  lastUpdate = Date.now();
};

let gameLoop = function () {
  var now = Date.now();
  var delta = now - lastUpdate;
  tick(delta / 1000);
  lastUpdate = now;
  window.requestAnimationFrame(gameLoop);
};

let tick = function (delta: number) {
  hero.tick(delta);
  draw();
};

let draw = function () {
  // Clear canvas
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  hero.draw(ctx);
};

let resizeCanvas = function () {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
};

$(function () {
  initialize();
});