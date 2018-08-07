var game = new Game(new Player("/img/hero.png"));

let gameLoop = () => {
  game = game.gameLoop(game);
  window.requestAnimationFrame(gameLoop);
}

$(() => { gameLoop(); });