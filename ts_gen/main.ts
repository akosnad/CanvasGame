/* start-debug */
const isDebugEnvironment = true;
/* end-debug */

if('serviceWorker' in navigator && typeof isDebugEnvironment == "undefined") {
   navigator.serviceWorker.register('/service-worker.js');
}

var game: CanvasGame.Game;
namespace CanvasGame {
  $(() => {
    if(typeof isDebugEnvironment != "undefined") {
      CanvasGame.Debug.debugInfoEnabled = true;
    }
    game = new Game(LevelLoader.load("/levels/0.json"));
    game.start();
  });
}