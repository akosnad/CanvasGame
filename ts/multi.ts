/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts"/>
/// <reference path="logic.ts" />

namespace CanvasGame {
    // Own data that gets sent to other players
    export class MultiPlayerData {
        playerId: number;
        levelId: number
        x: number;
        y: number;
        lastUpdateTimestamp: number;
        constructor(x: number, y: number, playerId: number, levelId: number, lastUpdateTimestamp: number) {
            this.playerId = playerId;
            this.levelId = levelId;
            this.x = x;
            this.y = y;
            this.lastUpdateTimestamp = lastUpdateTimestamp;
        }
    }
    export class Multiplayer {
        private connection: signalR.HubConnection;
        private playerId: number;
        private lastCleanupTimestamp = 0;
        private cleanupInterval = 30000;
        constructor() {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('/gameHub')
                .build();

            this.playerId = Date.now();
            var self = this;
            this.connection.on("ReceivePlayerData", (playerDataString) => self.receivePlayerData(playerDataString));
        }
        start() {
            var self = this;
            setTimeout(() => self.cleanupOldPlayerData(), this.cleanupInterval);
            this.connection.start().catch(err => console.error(err));
        }
        receivePlayerData(playerDataString: string) {
            var playerData = <MultiPlayerData>JSON.parse(playerDataString);
            // Don't process own player
            if (playerData.playerId == this.playerId) { return; }
            var playerExists = false;
            otherPlayers.forEach(player => {
                if (player.playerId == playerData.playerId) {
                    player.x = playerData.x;
                    player.y = playerData.y;
                    player.levelId = playerData.levelId;
                    playerExists = true;
                }
            });
            if (!playerExists) {
                otherPlayers.push(new OtherPlayer("/img/monster.png", playerData));
            }
        }
        sendPlayerData(player: Player, level: Level) {
            var playerData = JSON.stringify(new MultiPlayerData(player.x, player.y, this.playerId, level.id, Date.now()));
            this.connection.invoke("SendPlayerData", playerData);
        }
        cleanupOldPlayerData() {
            this.lastCleanupTimestamp = Date.now();
            otherPlayers.forEach((player, index) => {
                if (player.lastUpdateTimestamp + this.cleanupInterval < this.lastCleanupTimestamp) {
                    console.log("Cleaning up player: ", player);
                    otherPlayers.splice(index);
                }
            });
            var self = this;
            setTimeout(() => self.cleanupOldPlayerData(), this.cleanupInterval);
        }
    }
}