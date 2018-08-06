var ctx: any = null;

var hero = new LivingSprite("/img/hero.png");

var keysDown: boolean[] = new Array<boolean>();
var lastUpdate = Date.now();

let initialize = function () {
  var canvas: any = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
  window.addEventListener('keydown', function (e) {
    keysDown[e.keyCode] = true;
  });
  window.addEventListener('keyup', function (e) {
    delete keysDown[e.keyCode];
  });
  reset();
  gameLoop();
};

let reset = function () {
  hero.x = 0;
  hero.y = 0;
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
  // Limit velocity positive x
  if (hero.xVelocity > hero.xVelocityMax) { hero.xVelocity = hero.xVelocityMax; }
  // Limit velocity negative x
  if (hero.xVelocity < -hero.xVelocityMax) { hero.xVelocity = -hero.xVelocityMax; }

  // Only accept input if on ground
  if (hero.y <= 0) {
    // Jump
    if (GameKeys.up in keysDown) { hero.yVelocity += hero.jumpStrenght; }
    if (GameKeys.left in keysDown) {
      hero.xVelocity -= hero.xVelocityIncrease;
    }
    else if (GameKeys.right in keysDown) {
      hero.xVelocity += hero.xVelocityIncrease;
    }
    // Not pressing anything
    else {
      // If going positive x, decrease velocity gradually
      if (hero.xVelocity >= 0) {
        hero.xVelocity -= hero.xVelocityDecrease;
      }
      // If going negative x, increase velocity gradually
      if (hero.xVelocity < 0) {
        hero.xVelocity += hero.xVelocityDecrease;
      }
    }
  }
  
  hero.x += hero.xVelocity * delta // Apply x velocity
  hero.yVelocity -= hero.gravity; // Apply gravity
  hero.y += hero.yVelocity * delta // Apply y velocity

  // If hero hits left wall, stop
  if (hero.x < 0) {
    hero.x = 0;
    hero.xVelocity = 0;
  }
  // If hero hits ground, stop
  if (hero.y < 0) {
    hero.y = 0;
    hero.yVelocity = 0;
  }
  // If hero hits ceiling, stop
  if (hero.y > ctx.canvas.height) {
    hero.y = ctx.canvas.height;
    hero.yVelocity = 0;
  }
  draw();
};

let draw = function () {
  // Clear canvas
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw hero
  if (hero.imageReady) {
    ctx.drawImage(hero.image,
      hero.x,
      ctx.canvas.height - hero.y - hero.hitboxHeight
    );
  }
};

let resizeCanvas = function () {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
};

$(function () {
  initialize();
});