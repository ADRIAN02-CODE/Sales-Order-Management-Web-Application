using Microsoft.EntityFrameworkCore;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients { get; set; } = null!;
    public DbSet<Item> Items { get; set; } = null!;
    public DbSet<SalesOrder> SalesOrders { get; set; } = null!;
    public DbSet<SalesOrderItem> SalesOrderItems { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique indexes
        modelBuilder.Entity<Client>().HasIndex(c => c.Name).IsUnique();
        modelBuilder.Entity<Item>().HasIndex(i => i.Code).IsUnique();
        modelBuilder.Entity<SalesOrder>().HasIndex(o => o.InvoiceNo).IsUnique();

        // Configure relationships
        modelBuilder.Entity<SalesOrder>()
            .HasOne(o => o.Client)
            .WithMany()
            .HasForeignKey(o => o.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<SalesOrderItem>()
            .HasOne(i => i.SalesOrder)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(i => i.SalesOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SalesOrderItem>()
            .HasOne(i => i.Item)
            .WithMany()
            .HasForeignKey(i => i.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed data for Clients
        modelBuilder.Entity<Client>().HasData(
            new Client { Id = 1, Name = "Acme Corp", Address1 = "123 Main St", Address2 = "Suite 5", Address3 = "Level 2", Suburb = "Sydney", State = "NSW", PostCode = "2000" },
            new Client { Id = 2, Name = "Wayne Enterprises", Address1 = "100 Gotham Way", Address2 = "Wayne Tower", Address3 = "", Suburb = "Melbourne", State = "VIC", PostCode = "3000" },
            new Client { Id = 3, Name = "Stark Industries", Address1 = "456 Iron Man Ave", Address2 = "Stark Tower", Address3 = "Penthouse", Suburb = "Brisbane", State = "QLD", PostCode = "4000" },
            new Client { Id = 4, Name = "Globex Corporation", Address1 = "789 Cypress Creek Rd", Address2 = "", Address3 = "", Suburb = "Adelaide", State = "SA", PostCode = "5000" }
        );

        // Seed data for Items
        modelBuilder.Entity<Item>().HasData(
            new Item { Id = 1, Code = "ITM-001", Description = "Standard Widget", Price = 15.50m },
            new Item { Id = 2, Code = "ITM-002", Description = "Super Widget", Price = 29.99m },
            new Item { Id = 3, Code = "ITM-003", Description = "Mega Widget", Price = 49.95m },
            new Item { Id = 4, Code = "ITM-004", Description = "Premium Gadget", Price = 99.99m },
            new Item { Id = 5, Code = "ITM-005", Description = "Basic Gadget", Price = 12.00m }
        );
    }
}
