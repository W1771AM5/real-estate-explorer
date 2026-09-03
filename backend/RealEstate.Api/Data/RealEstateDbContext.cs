using Microsoft.EntityFrameworkCore;
using RealEstate.Api.Models;

namespace RealEstate.Api.Data;

/// <summary>
/// Entity Framework Core database context for the Real Estate Explorer application.
/// </summary>
public class RealEstateDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="RealEstateDbContext"/> class.
    /// </summary>
    /// <param name="options">The options to be used by this context.</param>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="options"/> is null.</exception>
    public RealEstateDbContext(DbContextOptions<RealEstateDbContext> options) : base(options)
    {
        ArgumentNullException.ThrowIfNull(options);
    }

    /// <summary>
    /// Gets or sets the <see cref="Property"/> entities.
    /// </summary>
    public DbSet<Property> Properties { get; set; } = null!;

    /// <inheritdoc/>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Property>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.City).IsRequired().HasMaxLength(100);
            entity.Property(p => p.Price).HasColumnType("numeric(18,2)");

            entity.HasData(
                new Property { Id = 1, City = "New York", Price = 980000m },
                new Property { Id = 2, City = "Los Angeles", Price = 750000m },
                new Property { Id = 3, City = "Chicago", Price = 420000m });
        });
    }
}