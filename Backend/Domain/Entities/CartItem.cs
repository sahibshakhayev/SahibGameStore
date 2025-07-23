using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;



public class CartItem : BaseEntity
{
    public Guid GameId { get; set; }
    public int Quantity { get; private set; }
    public Guid ShoppingCartId { get; set; }


    public ShoppingCart ShoppingCart { get; set; }
    public Game Game { get; set; }

    protected CartItem() { }

    public CartItem(Guid gameId, int quantity)
    {
        GameId = gameId;
        Quantity = quantity;

    }

    public void AddQty(int qty) => Quantity += qty;
    public void UpdateQty(int qty) => Quantity = qty;
}


