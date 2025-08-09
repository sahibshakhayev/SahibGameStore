using System;

namespace SahibGameStore.Domain.Entities
{
    public class GameOverview
    {

        private GameOverview() { }
        public GameOverview(Guid gameId, string html, string? video)
        {
            GameId = gameId;
            Html = html;
            VideoRelativeUrl = video;
        }

        public Guid Id { get; protected set; }    
        public Guid GameId { get; protected set; }
        public string Html { get; protected set; }

        public string? VideoRelativeUrl { get; protected set; }

        public void changeHtml(string html)
        {
            Html = html;
        }

        public void changeVideo(string video) {  VideoRelativeUrl = video; }     
    }
}
