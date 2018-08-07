namespace CanvasGame {
  var game = new Game(new Player("/img/hero.png"));

  $(() => {
    var monster = new LivingSprite("/img/monster.png", 500, 0);
    game.addSprite(monster);
    game.gameLoop();
  });
}