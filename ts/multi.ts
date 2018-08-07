/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts"/>
/// <reference path="logic.ts" />

namespace CanvasGame {
    export class Multiplayer {
        private connection: signalR.HubConnection;
        public players: Sprite[] = [];
        constructor() {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('/gameHub')
                .build();

            var self = this;
            this.connection.on("ReceiveData", (player, data) => self.receiveData(player, data));

            this.connection.start().catch(err => console.error(err));
        }
        receiveData(player: any, data: any) {
            console.log(player);
            console.log(data);
        }
        sendData(player: any, data: any) {
            this.connection.invoke("SendData", player, data);
        }
        sendPlayerData(player: Player) {
        }
    }
}