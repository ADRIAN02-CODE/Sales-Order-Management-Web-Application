namespace SalesOrderManagement.Domain.Entities;

public class Item
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
}
