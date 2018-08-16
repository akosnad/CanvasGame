var game: CanvasGame.Game;
namespace CanvasGame {
  $(() => {
    game = new Game(new Player("/img/hero.png", 0, 0));
    var monster = new Sprite("/img/monster.png", 500, 48);
    monster.solid = true;
    var otherMonster = new Sprite("/img/monster.png", 700, 0);
    otherMonster.solid = true;
    var thirdMonster = new Sprite("/img/monster.png", 1000, 32);
    thirdMonster.solid = true;
    thirdMonster.hitboxWidth = 100;
    var barricade = new Sprite("", 1500 , 0);
    barricade.hitboxHeight = 500;
    barricade.hitboxWidth = 32;
    barricade.solid = true;
    game.addSprites([monster, otherMonster, thirdMonster, barricade]);
    game.start();
  });
}