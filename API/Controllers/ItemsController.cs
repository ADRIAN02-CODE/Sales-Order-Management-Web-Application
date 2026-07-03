using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SalesOrderManagement.API.Models;
using SalesOrderManagement.Application.Interfaces;

namespace SalesOrderManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;
    private readonly IMapper _mapper;

    public ItemsController(IItemService itemService, IMapper mapper)
    {
        _itemService = itemService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems()
    {
        var items = await _itemService.GetAllItemsAsync();
        return Ok(_mapper.Map<IEnumerable<ItemDto>>(items));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(int id)
    {
        var item = await _itemService.GetItemByIdAsync(id);
        if (item == null)
        {
            return NotFound();
        }
        return Ok(_mapper.Map<ItemDto>(item));
    }
}
