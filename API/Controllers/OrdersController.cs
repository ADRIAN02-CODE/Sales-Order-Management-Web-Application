using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SalesOrderManagement.API.Models;
using SalesOrderManagement.Application.Interfaces;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ISalesOrderService _salesOrderService;
    private readonly IMapper _mapper;

    public OrdersController(ISalesOrderService salesOrderService, IMapper mapper)
    {
        _salesOrderService = salesOrderService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesOrderDto>>> GetOrders()
    {
        var orders = await _salesOrderService.GetAllOrdersAsync();
        return Ok(_mapper.Map<IEnumerable<SalesOrderDto>>(orders));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesOrderDto>> GetOrder(int id)
    {
        var order = await _salesOrderService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound();
        }
        return Ok(_mapper.Map<SalesOrderDto>(order));
    }

    [HttpPost]
    public async Task<ActionResult<SalesOrderDto>> CreateOrder([FromBody] SaveSalesOrderDto saveOrderDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate invoice number uniqueness
        if (await _salesOrderService.ExistsInvoiceNoAsync(saveOrderDto.InvoiceNo))
        {
            return BadRequest(new { message = $"Invoice number '{saveOrderDto.InvoiceNo}' is already taken." });
        }

        var order = _mapper.Map<SalesOrder>(saveOrderDto);
        var createdOrder = await _salesOrderService.CreateOrderAsync(order);
        
        // Fetch it again to include navigation properties (Client, Item) for response
        var fullyLoadedOrder = await _salesOrderService.GetOrderByIdAsync(createdOrder.Id);
        return CreatedAtAction(nameof(GetOrder), new { id = createdOrder.Id }, _mapper.Map<SalesOrderDto>(fullyLoadedOrder));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] SaveSalesOrderDto saveOrderDto)
    {
        if (id != saveOrderDto.Id)
        {
            return BadRequest(new { message = "ID mismatch in request URL and body." });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate invoice number uniqueness
        if (await _salesOrderService.ExistsInvoiceNoAsync(saveOrderDto.InvoiceNo, id))
        {
            return BadRequest(new { message = $"Invoice number '{saveOrderDto.InvoiceNo}' is already taken." });
        }

        var existingOrder = await _salesOrderService.GetOrderByIdAsync(id);
        if (existingOrder == null)
        {
            return NotFound();
        }

        // Map request payload onto existing entity context to allow repository tracking
        _mapper.Map(saveOrderDto, existingOrder);

        await _salesOrderService.UpdateOrderAsync(existingOrder);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _salesOrderService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound();
        }

        await _salesOrderService.DeleteOrderAsync(id);
        return NoContent();
    }

    [HttpGet("next-invoice-number")]
    public async Task<ActionResult<string>> GetNextInvoiceNumber()
    {
        var invoiceNo = await _salesOrderService.GenerateInvoiceNumberAsync();
        return Ok(new { invoiceNo });
    }

    [HttpGet("check-invoice-number")]
    public async Task<ActionResult<bool>> CheckInvoiceNumber([FromQuery] string invoiceNo, [FromQuery] int excludeId = 0)
    {
        var exists = await _salesOrderService.ExistsInvoiceNoAsync(invoiceNo, excludeId);
        return Ok(new { exists });
    }
}
