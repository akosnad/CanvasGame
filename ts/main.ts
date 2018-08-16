var game: CanvasGame.Game;
namespace CanvasGame {
  $(() => {
    game = new Game(LevelLoader.load("/levels/collisionTest.json"));
    game.start();
  });
}