var isDebugEnvironment = false;
/* start-debug */
isDebugEnvironment = true;
/* end-debug */

if('serviceWorker' in navigator && !isDebugEnvironment) {
   navigator.serviceWorker.register('/service-worker.js');
}

var game: CanvasGame.Game;
namespace CanvasGame {
  $(() => {
    if(isDebugEnvironment) {
      CanvasGame.Debug.debugInfoEnabled = true;
    }
    game = new Game(LevelLoader.load("/levels/0.json"));
    game.start();
  });
}