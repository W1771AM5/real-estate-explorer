using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Contracts;
using RealEstate.Api.Data;
using RealEstate.Api.Models;

namespace RealEstate.Api.Controllers;

/// <summary>
/// API endpoints for browsing <see cref="Property"/> listings.
/// </summary>
[ApiController]
[Route("api/properties")]
[Produces("application/json")]
public class PropertiesController : ControllerBase
{
    /// <summary>Default page size when <c>?take=</c> is not supplied.</summary>
    private const int DefaultTake = 200;

    /// <summary>Hard cap on <c>?take=</c> to keep responses sane.</summary>
    private const int MaxTake = 1_000;

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
    /// Gets a page of properties, optionally filtered.
    /// </summary>
    /// <param name="city">Filter by locality (case-insensitive exact match).</param>
    /// <param name="zip">Filter by 5-digit ZIP code.</param>
    /// <param name="minPrice">Inclusive lower bound on <c>price</c>.</param>
    /// <param name="maxPrice">Inclusive upper bound on <c>price</c>.</param>
    /// <param name="type">Filter by <c>propertyType</c> (exact match, e.g. "Condo for sale").</param>
    /// <param name="status">Filter by <c>listingStatus</c> (exact match, e.g. "Pending").</param>
    /// <param name="take">Maximum rows to return. Default 200, capped at 1000.</param>
    /// <param name="skip">Rows to skip (offset pagination).</param>
    /// <param name="cancellationToken">Token to cancel the operation.</param>
    /// <returns>A list of <see cref="PropertyDto"/> matching the filters.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PropertyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PropertyDto>>> GetProperties(
        [FromQuery] string? city,
        [FromQuery] string? zip,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] int? take,
        [FromQuery] int? skip,
        CancellationToken cancellationToken = default)
    {
        var effectiveTake = Math.Clamp(take ?? DefaultTake, 1, MaxTake);
        var effectiveSkip = Math.Max(skip ?? 0, 0);

        var query = _context.Properties.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(p => p.Locality == city);
        }
        if (!string.IsNullOrWhiteSpace(zip))
        {
            query = query.Where(p => p.Zip == zip);
        }
        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }
        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }
        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(p => p.PropertyType == type);
        }
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(p => p.ListingStatus == status);
        }

        var rows = await query
            .OrderBy(p => p.Id)
            .Skip(effectiveSkip)
            .Take(effectiveTake)
            .ToListAsync(cancellationToken);

        return Ok(rows.Select(ToDto));
    }

    /// <summary>
    /// Gets a single property by its identifier.
    /// </summary>
    /// <param name="id">The property identifier.</param>
    /// <param name="cancellationToken">Token to cancel the operation.</param>
    /// <returns>The property if found; otherwise a 404.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyDto>> GetProperty(int id, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        return property is null ? NotFound() : Ok(ToDto(property));
    }

    private static PropertyDto ToDto(Property p) => new()
    {
        Id = p.Id,
        BrokerTitle = p.BrokerTitle,
        PropertyType = p.PropertyType,
        ListingStatus = p.ListingStatus,
        Price = p.Price,
        Beds = p.Beds,
        Baths = p.Baths,
        PropertySqft = p.PropertySqft,
        Address = p.Address,
        State = p.State,
        Zip = p.Zip,
        AdministrativeAreaLevel2 = p.AdministrativeAreaLevel2,
        Locality = p.Locality,
        Sublocality = p.Sublocality,
        StreetName = p.StreetName,
        LongName = p.LongName,
        FormattedAddress = p.FormattedAddress,
        Latitude = p.Latitude,
        Longitude = p.Longitude,
    };
}
