namespace CanvasGame {
  var game = new Game(new Player("/img/hero.png", 0, 0));

  $(() => {
    var monster = new LivingSprite("/img/monster.png", 500, 0);
    game.addSprite(monster);
    game.gameLoop();
  });
}