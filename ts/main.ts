namespace CanvasGame {
  var game = new Game(new Player("/img/hero.png", 0, 0));

  $(() => {
    var monster = new LivingSprite("/img/monster.png", 500, 0);
    monster.movingDirections[MovingDirections.up] = 1;
    monster.gravity = 8;
    monster.jumpStrenght = 200;
    game.addSprite(monster);
    game.gameLoop();
  });
}