var game: CanvasGame.Game;
namespace CanvasGame {
  $(() => {
    game = new Game(LevelLoader.load("/levels/0.json"));
    game.start();
  });
}