using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;


public class ShoppingCart : BaseEntity
{
    public Guid UserId { get; private set; }
    public bool IsDeleted { get; private set; }
    public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    public ShoppingCart(Guid userId) => UserId = userId;

    public void AddItem(Game game, int quantity)
    {
        var existing = Items.FirstOrDefault(i => i.GameId == game.Id);
        if (existing != null)
        {
            existing.AddQty(quantity);
        }
        else
        {
            var item = new CartItem(game.Id, quantity)
            {
                ShoppingCart = this, 
                ShoppingCartId = this.Id 
            };
            Items.Add(item);
        }

        game.DecreaseAvailable(quantity);
    }


    public void RemoveItem(Game game)
    {
        var existing = Items.FirstOrDefault(i => i.GameId == game.Id);
        if (existing != null)
        {
            game.IncreaseAvailable(existing.Quantity);
            Items.Remove(existing);
        }
    }

    public void UpdateItem(Game game, int newQty)
    {
        var existing = Items.FirstOrDefault(i => i.GameId == game.Id)
            ?? throw new ApplicationException("Item not found");
        int delta = newQty - existing.Quantity;
        if (delta > 0 && game.AvailableQuantity < delta)
            throw new ApplicationException("Not enough stock");
        game.DecreaseAvailable(delta);
        existing.UpdateQty(newQty);
    }

    public void SubmitOrder(IEnumerable<Game> games)
    {
        foreach (var item in Items)
        {
            var game = games.Single(g => g.Id == item.GameId);
            game.DecreaseTotal(item.Quantity);
        }
        IsDeleted = true;
    }
}

