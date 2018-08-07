var game = new Game(new Player("/img/hero.png"));

let gameLoop = () => {
  game = game.gameLoop(game);
  window.requestAnimationFrame(gameLoop);
}

$(() => { 
  var monster = new Sprite("/img/monster.png");
  monster.x = 500;
  game.addSprite(monster);
  gameLoop();
});