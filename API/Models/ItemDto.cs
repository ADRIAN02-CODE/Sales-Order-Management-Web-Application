namespace SalesOrderManagement.API.Models;

public class ItemDto
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
}
