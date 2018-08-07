
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace CanvasGame
{
    public class GameHub : Hub
    {
        public async Task SendPlayerData(string playerData)
        {
            await Clients.Others.SendAsync("ReceivePlayerData", playerData);
        }
    }
}