using System;
using System.Collections.Generic;

namespace SalesOrderManagement.API.Models;

public class SalesOrderDto
{
    public int Id { get; set; }
    public string InvoiceNo { get; set; } = null!;
    public DateTime InvoiceDate { get; set; }
    public string? ReferenceNo { get; set; }
    
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    
    public string? Address1 { get; set; }
    public string? Address2 { get; set; }
    public string? Address3 { get; set; }
    public string? Suburb { get; set; }
    public string? State { get; set; }
    public string? PostCode { get; set; }
    
    public decimal TotalExcl { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalIncl { get; set; }
    
    public List<SalesOrderItemDto> OrderItems { get; set; } = new();
}
