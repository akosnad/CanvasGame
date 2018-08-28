
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace CanvasGame
{
    public class GameHub : Hub
    {
        public async Task SendPlayerPositionData(string playerData)
        {
            await Clients.Others.SendAsync("ReceivePlayerPositionData", playerData);
        }
        public async Task SendPlayerDescription(string playerDescription)
        {
            await Clients.Others.SendAsync("ReceivePlayerDescription", playerDescription);
        }
        public async Task RequestPlayerDescription(string playerId)
        {
            await Clients.Others.SendAsync("ReceiveRequestPlayerDescription", playerId);
        }
    }
}