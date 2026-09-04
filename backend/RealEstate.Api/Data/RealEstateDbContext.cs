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

            entity.Property(p => p.BrokerTitle).IsRequired().HasMaxLength(300);
            entity.Property(p => p.PropertyType).HasMaxLength(50);
            entity.Property(p => p.ListingStatus).HasMaxLength(50);
            entity.Property(p => p.Price).HasColumnType("numeric(18,2)");
            entity.Property(p => p.Address).IsRequired().HasMaxLength(500);
            entity.Property(p => p.State).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Zip).HasMaxLength(10);
            entity.Property(p => p.AdministrativeAreaLevel2).HasMaxLength(200);
            entity.Property(p => p.Locality).HasMaxLength(100);
            entity.Property(p => p.Sublocality).HasMaxLength(100);
            entity.Property(p => p.StreetName).HasMaxLength(200);
            entity.Property(p => p.LongName).HasMaxLength(200);
            entity.Property(p => p.FormattedAddress).HasMaxLength(500);
            entity.Property(p => p.Latitude).HasColumnType("double precision");
            entity.Property(p => p.Longitude).HasColumnType("double precision");

            entity.HasIndex(p => p.Locality).HasDatabaseName("IX_Properties_Locality");
            entity.HasIndex(p => p.Zip).HasDatabaseName("IX_Properties_Zip");
            entity.HasIndex(p => p.Price).HasDatabaseName("IX_Properties_Price");
            entity.HasIndex(p => new { p.PropertyType, p.ListingStatus })
                .HasDatabaseName("IX_Properties_Type_Status");
        });
    }
}
