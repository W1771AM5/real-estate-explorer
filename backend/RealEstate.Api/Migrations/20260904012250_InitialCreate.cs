using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace RealEstate.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BrokerTitle = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    PropertyType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ListingStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    Beds = table.Column<int>(type: "integer", nullable: true),
                    Baths = table.Column<int>(type: "integer", nullable: true),
                    PropertySqft = table.Column<int>(type: "integer", nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    State = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Zip = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    AdministrativeAreaLevel2 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Locality = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Sublocality = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    StreetName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    LongName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    FormattedAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Locality",
                table: "Properties",
                column: "Locality");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Price",
                table: "Properties",
                column: "Price");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Type_Status",
                table: "Properties",
                columns: new[] { "PropertyType", "ListingStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Zip",
                table: "Properties",
                column: "Zip");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Properties");
        }
    }
}
