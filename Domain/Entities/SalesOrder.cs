using System;
using System.Collections.Generic;

namespace SalesOrderManagement.Domain.Entities;

public class SalesOrder
{
    public int Id { get; set; }
    public required string InvoiceNo { get; set; }
    public DateTime InvoiceDate { get; set; }
    public string? ReferenceNo { get; set; }
    
    public int ClientId { get; set; }
    public Client? Client { get; set; }
    
    public string? Address1 { get; set; }
    public string? Address2 { get; set; }
    public string? Address3 { get; set; }
    public string? Suburb { get; set; }
    public string? State { get; set; }
    public string? PostCode { get; set; }
    
    public decimal TotalExcl { get; set; }
    public decimal TotalTax { get; set; }
    public decimal TotalIncl { get; set; }
    
    public List<SalesOrderItem> OrderItems { get; set; } = new();
}
