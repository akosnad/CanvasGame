
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace CanvasGame
{
    public class GameHub : Hub
    {
        public async Task SendData(string player, string data)
        {
            await Clients.All.SendAsync("ReceiveData", player, data);
        }
    }
}