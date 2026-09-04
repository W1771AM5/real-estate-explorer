namespace RealEstate.Api.Contracts;

/// <summary>
/// A listing as exposed by the API. Mirrors <see cref="RealEstate.Api.Models.Property"/>
/// but with camelCase serialization and no EF change-tracking concerns.
/// </summary>
public sealed class PropertyDto
{
    /// <summary>Database identifier.</summary>
    public int Id { get; set; }

    /// <summary>Listing broker / agency.</summary>
    public string BrokerTitle { get; set; } = string.Empty;

    /// <summary>Property type, e.g. "Condo for sale". Null when unknown.</summary>
    public string? PropertyType { get; set; }

    /// <summary>Listing status, e.g. "For sale", "Pending". Null when unknown.</summary>
    public string? ListingStatus { get; set; }

    /// <summary>Asking price in USD. Null when unknown.</summary>
    public decimal? Price { get; set; }

    /// <summary>Bedrooms. Null when unknown.</summary>
    public int? Beds { get; set; }

    /// <summary>Bathrooms. Null when unknown.</summary>
    public int? Baths { get; set; }

    /// <summary>Property size in square feet. Null when unknown.</summary>
    public int? PropertySqft { get; set; }

    /// <summary>Street address (no city / state).</summary>
    public string Address { get; set; } = string.Empty;

    /// <summary>City + state + ZIP line, e.g. "New York, NY 10022".</summary>
    public string State { get; set; } = string.Empty;

    /// <summary>Five-digit ZIP code, e.g. "10022". Null when unknown.</summary>
    public string? Zip { get; set; }

    /// <summary>Borough / county, e.g. "New York County". Null when unknown.</summary>
    public string? AdministrativeAreaLevel2 { get; set; }

    /// <summary>City, e.g. "New York". Null when unknown.</summary>
    public string? Locality { get; set; }

    /// <summary>Neighborhood, e.g. "Manhattan". Null when unknown.</summary>
    public string? Sublocality { get; set; }

    /// <summary>Street name only. Null when unknown.</summary>
    public string? StreetName { get; set; }

    /// <summary>Building name. Null when unknown.</summary>
    public string? LongName { get; set; }

    /// <summary>Fully formatted address string. Null when unknown.</summary>
    public string? FormattedAddress { get; set; }

    /// <summary>WGS84 latitude. Null when unknown.</summary>
    public double? Latitude { get; set; }

    /// <summary>WGS84 longitude. Null when unknown.</summary>
    public double? Longitude { get; set; }
}
