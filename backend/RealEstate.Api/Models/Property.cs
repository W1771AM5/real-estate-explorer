namespace RealEstate.Api.Models;

/// <summary>
/// Represents a real estate listing in the catalog, mirroring a row of the
/// cleaned NY-House dataset.
/// </summary>
public class Property
{
    /// <summary>
    /// Gets or sets the unique identifier for the property.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the listing broker / agency name.
    /// </summary>
    public string BrokerTitle { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the property type (e.g. "Condo for sale", "Co-op for sale").
    /// </summary>
    public string? PropertyType { get; set; }

    /// <summary>
    /// Gets or sets the current listing status (e.g. "For sale", "Pending").
    /// </summary>
    public string? ListingStatus { get; set; }

    /// <summary>
    /// Gets or sets the asking price of the property.
    /// </summary>
    public decimal? Price { get; set; }

    /// <summary>
    /// Gets or sets the number of bedrooms.
    /// </summary>
    public int? Beds { get; set; }

    /// <summary>
    /// Gets or sets the number of bathrooms.
    /// </summary>
    public int? Baths { get; set; }

    /// <summary>
    /// Gets or sets the property size in square feet.
    /// </summary>
    public int? PropertySqft { get; set; }

    /// <summary>
    /// Gets or sets the street address.
    /// </summary>
    public string Address { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the state / city ZIP line, e.g. "New York, NY 10022".
    /// </summary>
    public string State { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the five-digit ZIP code.
    /// </summary>
    public string? Zip { get; set; }

    /// <summary>
    /// Gets or sets the borough / county (e.g. "New York County").
    /// </summary>
    public string? AdministrativeAreaLevel2 { get; set; }

    /// <summary>
    /// Gets or sets the city (e.g. "New York").
    /// </summary>
    public string? Locality { get; set; }

    /// <summary>
    /// Gets or sets the neighborhood (e.g. "Manhattan", "Flushing").
    /// </summary>
    public string? Sublocality { get; set; }

    /// <summary>
    /// Gets or sets the street name.
    /// </summary>
    public string? StreetName { get; set; }

    /// <summary>
    /// Gets or sets the building name.
    /// </summary>
    public string? LongName { get; set; }

    /// <summary>
    /// Gets or sets the formatted full address.
    /// </summary>
    public string? FormattedAddress { get; set; }

    /// <summary>
    /// Gets or sets the latitude.
    /// </summary>
    public double? Latitude { get; set; }

    /// <summary>
    /// Gets or sets the longitude.
    /// </summary>
    public double? Longitude { get; set; }
}
