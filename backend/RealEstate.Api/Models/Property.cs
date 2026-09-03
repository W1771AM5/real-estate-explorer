namespace RealEstate.Api.Models;

/// <summary>
/// Represents a real estate listing in the catalog.
/// </summary>
public class Property
{
    /// <summary>
    /// Gets or sets the unique identifier for the property.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the city where the property is located.
    /// </summary>
    public string City { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the asking price of the property.
    /// </summary>
    public decimal Price { get; set; }
}