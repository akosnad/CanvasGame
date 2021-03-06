/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts"/>

namespace CanvasGame {
    // Own data that gets sent to other players
    export class MultiplayerPositionData {
        playerId: number;
        levelId: number
        x: number;
        y: number;
        isPaused: boolean;
        constructor(x: number, y: number, playerId: number, levelId: number, isPaused: boolean) {
            this.playerId = playerId;
            this.levelId = levelId;
            this.x = x;
            this.y = y;
            this.isPaused = isPaused;
        }
    }
    export class MultiplayerDescription {
        playerId: number;
        playerName: string;
        playerImageSource: string;
        constructor(id: number, name: string, imgSrc: string) {
            this.playerId = id;
            this.playerName = name;
            this.playerImageSource = imgSrc;
        }
    }
    export class ChatMessage {
        SenderName: string;
        Message: string;
        constructor(senderName: string, message: string) {
            this.SenderName = senderName;
            this.Message = message;
        }
    }
    export class Multiplayer {
        private isRunning = false;
        private connection: signalR.HubConnection;
        private game: Game;
        private playerId: number;
        private lastCleanupTimestamp = 0;
        private cleanupInterval = 30000;
        lastDescriptionRequest = 0;
        constructor(game: Game) {
            this.game = game;
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl('/gameHub')
                .build();

            this.playerId = Date.now();
            var self = this;
            this.connection.on("ReceivePlayerPositionData", (playerPositionDataString) => self.receivePlayerPositionData(playerPositionDataString));
            this.connection.on("ReceivePlayerDescription", (playerDescription) => { self.receivePlayerDescription(playerDescription) });
            this.connection.on("ReceiveRequestPlayerDescription", () => { self.sendPlayerDescription(); });
            this.connection.on("ReceivePlayerDisconnected", (playerId) => { self.receivePlayerDisconnected(playerId); })
            this.connection.on("ReceiveChatMessage", (chatMessage) => { self.receiveChatMessage(chatMessage); })

            this.connection.onclose((error) => { self.onclose(error) });
            setTimeout(() => self.cleanupOldPlayerData(), this.cleanupInterval);
        }
        start() {
            Debug.log("Starting multiplayer");
            var self = this;
            this.connection.start().then(() => { self.isRunning = true; }, err => { self.onclose(err) });
        }
        receivePlayerDescription(playerDescriptionString: string) {
            let playerDescription = <MultiplayerDescription>JSON.parse(playerDescriptionString);
            Debug.log("Received player description: ", playerDescription);
            if (playerDescription.playerId == this.playerId) { return; }
            let playerExists = false;
            otherPlayers.forEach(player => {
                if (player.playerId == playerDescription.playerId) {
                    player.setImage(playerDescription.playerImageSource);
                    player.name = playerDescription.playerName;
                    playerExists = true;
                }
            });
            if (!playerExists) {
                let newPlayer = new OtherPlayer();
                newPlayer.playerId = playerDescription.playerId;
                newPlayer.name = playerDescription.playerName;
                newPlayer.setImage(playerDescription.playerImageSource);
                otherPlayers.push(newPlayer);
            }
        }
        sendPlayerDescription() {
            let data = new MultiplayerDescription(
                this.playerId,
                this.game.player.name,
                this.game.player.imageSource
            );
            Debug.log("Sending own description data: ", data);
            this.connection.invoke("SendPlayerDescription", JSON.stringify(data));
        }
        receivePlayerPositionData(playerDataString: string) {
            var playerData = <MultiplayerPositionData>JSON.parse(playerDataString);
            // Debug.log("POS: ", playerData);
            // Don't process own player
            if (playerData.playerId == this.playerId) { return; }
            var playerExists = false;
            otherPlayers.forEach(player => {
                if (player.playerId == playerData.playerId) {
                    player.x = playerData.x;
                    player.y = playerData.y;
                    player.levelId = playerData.levelId;
                    player.isPaused = playerData.isPaused;
                    player.lastUpdateTimestamp = Date.now();
                    playerExists = true;
                }
            });
            if (!playerExists) {
                this.requestPlayerDescription(playerData.playerId);
            }
        }
        sendPlayerPositionData(player: Player, level: Level, isPaused: boolean) {
            if (this.isRunning) {
                var playerData = JSON.stringify(new MultiplayerPositionData(player.x, player.y, this.playerId, level.id, isPaused));
                this.connection.invoke("SendPlayerPositionData", playerData);
            }
        }
        requestPlayerDescription(id: number) {
            let lastRequestDelta = Date.now() - this.lastDescriptionRequest;
            if (lastRequestDelta > 15000) {
                this.lastDescriptionRequest = Date.now();
                Debug.log("Requesting player description for ", id);
                this.connection.invoke("RequestPlayerDescription", id);
            }
        }
        receivePlayerDisconnected(playerId: number) {
            Debug.log("Player disconnected: ", playerId);
            otherPlayers = otherPlayers.filter(player => { player.playerId != playerId });
        }
        sendChatMessage(message: string) {
            if (message != "") {
                this.connection.invoke("SendChatMessage", message);
            }
        }
        receiveChatMessage(chatMessageString: string) {
            let chatMessage = <ChatMessage>JSON.parse(chatMessageString);
            this.game.chat.receiveMessage(chatMessage.SenderName, chatMessage.Message);
        }
        onclose(error: Error | undefined) {
            Debug.log("Multiplayer stopped with error: ", error);
            this.stop();
            Debug.log("Multiplayer: retrying in 10 seconds...");
            var self = this;
            setTimeout(() => { self.start(); }, 10000);
        }
        stop() {
            this.isRunning = false;
            this.connection.stop();
            otherPlayers = new Array<OtherPlayer>();
        }
        cleanupOldPlayerData() {
            this.lastCleanupTimestamp = Date.now();
            otherPlayers.forEach((player, index) => {
                if (player.lastUpdateTimestamp + this.cleanupInterval < this.lastCleanupTimestamp) {
                    Debug.log("Cleaning up old player: ", player);
                    otherPlayers.splice(index);
                }
            });
            var self = this;
            setTimeout(() => self.cleanupOldPlayerData(), this.cleanupInterval);
        }
    }

    export class Chat {
        private chatBox = <HTMLElement>document.getElementById("chat-box");
        private chatList = <HTMLElement>document.getElementById("chat-list");
        private sendButton = <HTMLElement>document.getElementById("chat-send");
        private chatInput = <HTMLElement>document.getElementById("chat-input");
        private game: Game;
        constructor(game: Game) {
            this.game = game;
            this.sendButton.addEventListener("click", () => { this.sendMessage(); });
        }
        public show() {
            $(this.chatBox).show();
            $(this.chatBox).addClass("slide-in-blurred-left");
            $(this.chatBox).removeClass("slide-out-blurred-right");
        }
        public hide() {
            $(this.chatBox).removeClass("slide-in-blurred-left");
            $(this.chatBox).addClass("slide-out-blurred-right");
            var self = this;
            setTimeout(() => { $(self.chatBox).hide(); }, 500);
        }
        public receiveMessage(senderUsername: string, message: string) {
            let listItem = document.createElement('li');
            listItem.setAttribute("class", "list-group-item");
            listItem.innerText = `${senderUsername}: ${message}`;
            this.chatList.appendChild(listItem);
        }
        public sendMessage() {
            let message = $(this.chatInput).val();
            if(typeof message == "string") {
                this.game.multi.sendChatMessage(message);
                this.receiveMessage(this.game.player.name, message);
                $(this.chatInput).val("");
            }
        }
    }
}