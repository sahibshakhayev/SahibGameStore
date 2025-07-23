using Microsoft.EntityFrameworkCore;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class OrderRepository : Repository<Order>, IOrderRepository
{
    private readonly SahibGameStoreContext _db;

    public OrderRepository(SahibGameStoreContext db) : base(db)
    {
        _db = db;
    }

    public async Task<(IEnumerable<Order> orders, int totalCount)> GetByUserAsync(Guid userId, int page, int pageSize)
    {
        var query = _db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.ShoppingCart)
                .ThenInclude(sc => sc.Items)
                .ThenInclude(i => i.Game)
            .Include(o => o.FormOfPayment).AsQueryable();


        var totalCount =  await query.CountAsync();

        var orders = await query.OrderByDescending(o => o.CreatedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (orders, totalCount);
    }

    public async Task<(IEnumerable<Order> orders, int totalCount)> GetAllAsync(int page, int pageSize, Guid? userFilter = null)
    {
        var query = _db.Orders
            .Include(o => o.ShoppingCart)
                .ThenInclude(sc => sc.Items).ThenInclude(i => i.Game)
            .Include(o => o.FormOfPayment)
            .AsQueryable();

        if (userFilter.HasValue)
            query = query.Where(o => o.UserId == userFilter.Value);

        int totalCount = await query.CountAsync();


        var orders = await query
            .OrderByDescending(o => o.CreatedDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (orders, totalCount);
    }

    public override async Task<Order> GetByIdAsync(Guid id)
    {
        return await _db.Orders
            .Include(o => o.ShoppingCart)
                .ThenInclude(sc => sc.Items).ThenInclude(i => i.Game)
            .Include(o => o.FormOfPayment)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task AddAsync(Order order)
    {
        await _db.Orders.AddAsync(order);
    }

    public async Task UpdateAsync(Order order)
    {
        _db.Orders.Update(order);
        await Task.CompletedTask;
    }
}
