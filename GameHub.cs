
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace CanvasGame
{
    public class PlayerDescription
    {
        [JsonProperty("playerId")]
        public string Id { get; set; }
        [JsonProperty("playerName")]
        public string playerName { get; set; }
        [JsonProperty("playerImageSource")]
        public string playerImageSource { get; set; }
    }

    public class PlayerPositionData
    {
        [JsonProperty("playerId")]
        public string Id { get; set; }
        [JsonProperty("levelId")]
        public string LevelId { get; set; }
        [JsonProperty("x")]
        public int x { get; set; }
        [JsonProperty("y")]
        public int y { get; set; }
        [JsonProperty("lastUpdateTimestamp")]
        public DateTime LastUpdate { get; set; }
        [JsonProperty("isPaused")]
        public bool IsPaused { get; set; }
    }

    public class Player
    {
        public PlayerDescription PlayerDescription { get; set; }
        public string ConnectionId { get; set; }
    }

    public class PlayerDescriptionRequest
    {
        public string RequesterConnectionId { get; set; }
        public string TargetPlayerId { get; set; }
        public DateTime RequestTimestamp { get; set; }
    }
    public class GameHub : Hub
    {
        public static List<Player> Players = new List<Player>();
        public static List<PlayerDescriptionRequest> PlayerDescriptionRequests = new List<PlayerDescriptionRequest>();
        public async Task SendPlayerPositionData(string playerPositionData)
        {
            await Clients.Others.SendAsync("ReceivePlayerPositionData", playerPositionData);
        }
        public async Task SendPlayerDescription(string playerDescriptionString)
        {
            var playerDescription = JsonConvert.DeserializeObject<PlayerDescription>(playerDescriptionString);
            Console.Write("SendPlayerDescription from {0}", playerDescription.Id);

            var i = Players.FindIndex(p => p.PlayerDescription.Id == playerDescription.Id);
            if (i >= 0)
            {
                Players[i].PlayerDescription = playerDescription;
                Players[i].ConnectionId = Context.ConnectionId;
            }
            else
            {
                Players.Add(new Player
                {
                    PlayerDescription = playerDescription,
                    ConnectionId = Context.ConnectionId
                });
            }

            var requests = new List<PlayerDescriptionRequest>();
            if(PlayerDescriptionRequests.Count > 0)
            {
                requests.AddRange(PlayerDescriptionRequests.Where(pdr => pdr.TargetPlayerId == playerDescription.Id));
            }
            if(requests.Count > 0)
            {
                foreach (var request in requests)
                {
                    await Clients.Client(request.RequesterConnectionId).SendAsync("ReceivePlayerDescription", playerDescriptionString);
                }
                PlayerDescriptionRequests = new List<PlayerDescriptionRequest>(PlayerDescriptionRequests.Except(requests));
            }
            else
            {
                await Clients.Others.SendAsync("ReceivePlayerDescription", playerDescriptionString);
            }
        }
        public async Task RequestPlayerDescription(string targetId)
        {
            Console.WriteLine("RequestPlayerDescription from {0} for {1}", Context.ConnectionId, targetId);
            var targetPlayer = Players.SingleOrDefault(p => p.PlayerDescription.Id == targetId);
            if (targetPlayer != null)
            {
                // await Clients.Client(targetPlayer.ConnectionId).SendAsync("ReceiveRequestPlayerDescription");
                var descriptionString = JsonConvert.SerializeObject(targetPlayer.PlayerDescription);
                await Clients.Caller.SendAsync("ReceivePlayerDescription", descriptionString);
            }
            else
            {
                var request = new PlayerDescriptionRequest
                {
                    TargetPlayerId = targetId,
                    RequesterConnectionId = Context.ConnectionId,
                    RequestTimestamp = DateTime.Now
                };
                if (PlayerDescriptionRequests.Where(pdr => pdr.TargetPlayerId == targetId).Count() == 0)
                {
                    PlayerDescriptionRequests.Add(request);
                }
            }
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine("Client connected: {0}", Context.ConnectionId);
            await Clients.Client(Context.ConnectionId).SendAsync("ReceiveRequestPlayerDescription");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine("Client disconnected: {0}", Context.ConnectionId);
            var toRemove = Players.SingleOrDefault(p => p.ConnectionId == Context.ConnectionId);
            Players.Remove(toRemove);
            await Clients.All.SendAsync("ReceivePlayerDisconnected", toRemove.PlayerDescription.Id);
            await base.OnDisconnectedAsync(exception);
        }
    }
}