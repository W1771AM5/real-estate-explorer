using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Data;
using RealEstate.Api.Models;

namespace RealEstate.Api.Controllers;

/// <summary>
/// API endpoints for managing <see cref="Property"/> listings.
/// </summary>
[ApiController]
[Route("api/properties")]
public class PropertiesController : ControllerBase
{
    private readonly RealEstateDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="PropertiesController"/> class.
    /// </summary>
    /// <param name="context">The database context to use.</param>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="context"/> is null.</exception>
    public PropertiesController(RealEstateDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        _context = context;
    }

    /// <summary>
    /// Gets all properties.
    /// </summary>
    /// <param name="cancellationToken">Token to cancel the operation.</param>
    /// <returns>The list of properties.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Property>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Property>>> GetProperties(CancellationToken cancellationToken)
    {
        var properties = await _context.Properties
            .AsNoTracking()
            .OrderBy(p => p.Id)
            .ToListAsync(cancellationToken);

        return Ok(properties);
    }

    /// <summary>
    /// Gets a single property by its identifier.
    /// </summary>
    /// <param name="id">The property identifier.</param>
    /// <param name="cancellationToken">Token to cancel the operation.</param>
    /// <returns>The property if found; otherwise, a 404 response.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Property), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Property>> GetProperty(int id, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        return property is null ? NotFound() : Ok(property);
    }
}