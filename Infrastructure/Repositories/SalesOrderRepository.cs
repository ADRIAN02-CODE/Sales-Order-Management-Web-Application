using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SalesOrderManagement.Application.Interfaces;
using SalesOrderManagement.Domain.Entities;
using SalesOrderManagement.Infrastructure.Data;

namespace SalesOrderManagement.Infrastructure.Repositories;

public class SalesOrderRepository : ISalesOrderRepository
{
    private readonly ApplicationDbContext _context;

    public SalesOrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SalesOrder>> GetAllAsync()
    {
        return await _context.SalesOrders
            .Include(o => o.Client)
            .OrderByDescending(o => o.InvoiceDate)
            .ToListAsync();
    }

    public async Task<SalesOrder?> GetByIdWithItemsAsync(int id)
    {
        return await _context.SalesOrders
            .Include(o => o.Client)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Item)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task AddAsync(SalesOrder salesOrder)
    {
        await _context.SalesOrders.AddAsync(salesOrder);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(SalesOrder salesOrder)
    {
        var existingOrder = await _context.SalesOrders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == salesOrder.Id);

        if (existingOrder == null) return;

        // Update header values
        _context.Entry(existingOrder).CurrentValues.SetValues(salesOrder);

        // Delete removed lines
        var linesToRemove = existingOrder.OrderItems
            .Where(existingLine => !salesOrder.OrderItems.Any(newLine => newLine.Id == existingLine.Id))
            .ToList();
            
        foreach (var line in linesToRemove)
        {
            _context.SalesOrderItems.Remove(line);
        }

        // Add or Update lines
        foreach (var newLine in salesOrder.OrderItems)
        {
            var existingLine = existingOrder.OrderItems.FirstOrDefault(el => el.Id == newLine.Id && el.Id != 0);
            if (existingLine != null)
            {
                // Update line
                _context.Entry(existingLine).CurrentValues.SetValues(newLine);
            }
            else
            {
                // Insert new line
                existingOrder.OrderItems.Add(new SalesOrderItem
                {
                    ItemId = newLine.ItemId,
                    Note = newLine.Note,
                    Quantity = newLine.Quantity,
                    Price = newLine.Price,
                    TaxRate = newLine.TaxRate,
                    ExclAmount = newLine.ExclAmount,
                    TaxAmount = newLine.TaxAmount,
                    InclAmount = newLine.InclAmount
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var order = await _context.SalesOrders.FindAsync(id);
        if (order != null)
        {
            _context.SalesOrders.Remove(order);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.SalesOrders.AnyAsync(o => o.Id == id);
    }

    public async Task<bool> ExistsInvoiceNoAsync(string invoiceNo, int excludeOrderId = 0)
    {
        if (string.IsNullOrWhiteSpace(invoiceNo)) return false;
        
        return await _context.SalesOrders.AnyAsync(o => 
            o.InvoiceNo.ToLower() == invoiceNo.ToLower() && 
            o.Id != excludeOrderId);
    }
}
