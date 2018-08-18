// if('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js');
// }

var game: CanvasGame.Game;
namespace CanvasGame {
  $(() => {
    game = new Game(LevelLoader.load("/levels/0.json"));
    game.start();
  });
}