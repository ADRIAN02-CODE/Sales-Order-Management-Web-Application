using System;
using System.Collections.Generic;

namespace SalesOrderManagement.API.Models;

public class SaveSalesOrderDto
{
    public int Id { get; set; }
    public string InvoiceNo { get; set; } = null!;
    public DateTime InvoiceDate { get; set; }
    public string? ReferenceNo { get; set; }
    
    public int ClientId { get; set; }
    
    public string? Address1 { get; set; }
    public string? Address2 { get; set; }
    public string? Address3 { get; set; }
    public string? Suburb { get; set; }
    public string? State { get; set; }
    public string? PostCode { get; set; }
    
    public List<SaveSalesOrderItemDto> OrderItems { get; set; } = new();
}

public class SaveSalesOrderItemDto
{

    public int Id { get; set; }
    public int ItemId { get; set; }
    public string? Note { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal TaxRate { get; set; }
    
}
