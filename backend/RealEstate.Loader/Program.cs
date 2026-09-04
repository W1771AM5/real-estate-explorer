using System.Diagnostics;
using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using Npgsql;

namespace RealEstate.Loader;

internal static class Program
{
    private const string DefaultConnection =
        "Host=localhost;Port=5432;Database=realestate;Username=realestate_user;Password=realestate_password";

    private static int Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("REALESTATE_CONNECTION")
            ?? DefaultConnection;

        var csvPath = Environment.GetEnvironmentVariable("REALESTATE_CSV")
            ?? LocateDefaultCsv();

        if (csvPath is null || !File.Exists(csvPath))
        {
            Console.Error.WriteLine($"Cleaned CSV not found. Looked at: {csvPath ?? "(not resolved)"}. Set REALESTATE_CSV env var to override.");
            return 2;
        }

        Console.WriteLine($"CSV      : {csvPath}");
        Console.WriteLine($"Database : {MaskConnectionString(connectionString)}");

        var sw = Stopwatch.StartNew();
        var (read, written) = LoadAsync(connectionString, csvPath).GetAwaiter().GetResult();
        sw.Stop();

        Console.WriteLine($"Done. read={read}  written={written}  elapsed={sw.ElapsedMilliseconds} ms");
        return 0;
    }

    private static string? LocateDefaultCsv()
    {
        // Look next to the executable and walk up to the repo root.
        var candidates = new List<string>
        {
            Path.Combine(AppContext.BaseDirectory, "Data", "NY-House-Dataset.cleaned.csv"),
            Path.Combine(AppContext.BaseDirectory, "NY-House-Dataset.cleaned.csv"),
        };

        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        for (var i = 0; i < 6 && dir is not null; i++, dir = dir.Parent)
        {
            candidates.Add(Path.Combine(dir.FullName, "database", "etl", "cleaned", "NY-House-Dataset.cleaned.csv"));
        }

        return candidates.FirstOrDefault(File.Exists);
    }

    private static string MaskConnectionString(string cs)
    {
        return System.Text.RegularExpressions.Regex.Replace(cs, "(?i)(password=)([^;]+)", "$1***");
    }

    private static async Task<(int Read, int Written)> LoadAsync(string connectionString, string csvPath)
    {
        await using var conn = new NpgsqlConnection(connectionString);
        await conn.OpenAsync();

        // 1) Truncate so the loader is re-runnable.
        await using (var trunc = new NpgsqlCommand("TRUNCATE TABLE \"Properties\" RESTART IDENTITY", conn))
        {
            await trunc.ExecuteNonQueryAsync();
        }

        // 2) COPY from CSV using Postgres' default TEXT format (tab-separated, \\N for null).
        const string copySql =
            "COPY \"Properties\" (" +
            "\"BrokerTitle\", \"PropertyType\", \"ListingStatus\", \"Price\", \"Beds\", \"Baths\", \"PropertySqft\", " +
            "\"Address\", \"State\", \"Zip\", \"AdministrativeAreaLevel2\", \"Locality\", \"Sublocality\", " +
            "\"StreetName\", \"LongName\", \"FormattedAddress\", \"Latitude\", \"Longitude\"" +
            ") FROM STDIN";

        var cfg = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            BadDataFound = null,
            MissingFieldFound = null,
            HeaderValidated = null,
        };

        int read = 0;
        await using (var importer = await conn.BeginTextImportAsync(copySql))
        {
            using var reader = new StreamReader(csvPath);
            using var csv = new CsvReader(reader, cfg);

            if (!await csv.ReadAsync())
            {
                throw new InvalidOperationException("CSV is empty.");
            }
            csv.ReadHeader();

            while (await csv.ReadAsync())
            {
                read++;
                await importer.WriteLineAsync(BuildLine(
                    csv.GetField("BROKERTITLE"),
                    csv.GetField("PropertyType"),
                    csv.GetField("ListingStatus"),
                    csv.GetField("PRICE"),
                    csv.GetField("BEDS"),
                    csv.GetField("BATH"),
                    csv.GetField("PROPERTYSQFT"),
                    csv.GetField("ADDRESS"),
                    csv.GetField("STATE"),
                    csv.GetField("Zip"),
                    csv.GetField("ADMINISTRATIVE_AREA_LEVEL_2"),
                    csv.GetField("LOCALITY"),
                    csv.GetField("SUBLOCALITY"),
                    csv.GetField("STREET_NAME"),
                    csv.GetField("LONG_NAME"),
                    csv.GetField("FORMATTED_ADDRESS"),
                    csv.GetField("LATITUDE"),
                    csv.GetField("LONGITUDE")
                ));
            }
        }

        // 3) Report actual rows written.
        long written;
        await using (var count = new NpgsqlCommand("SELECT COUNT(*) FROM \"Properties\"", conn))
        {
            written = (long)(await count.ExecuteScalarAsync())!;
        }
        return (read, (int)written);

        // Build a Postgres TEXT-format line (tab-separated, \\N for null).
        static string BuildLine(
            string? brokerTitle, string? propertyType, string? listingStatus,
            string? price, string? beds, string? baths, string? sqft,
            string? address, string? state, string? zip,
            string? adminArea, string? locality, string? sublocality,
            string? streetName, string? longName, string? formattedAddress,
            string? latitude, string? longitude)
        {
            return string.Join('\t',
                Escape(brokerTitle),
                Escape(propertyType),
                Escape(listingStatus),
                Escape(price),
                Escape(StripFloat(beds)),
                Escape(StripFloat(baths)),
                Escape(StripFloat(sqft)),
                Escape(address),
                Escape(state),
                Escape(zip),
                Escape(adminArea),
                Escape(locality),
                Escape(sublocality),
                Escape(streetName),
                Escape(longName),
                Escape(formattedAddress),
                Escape(latitude),
                Escape(longitude)
            );
        }

        // The cleaned CSV holds integer columns (Beds, Baths, PropertySqft) as floats
        // such as "2.0" because pandas wrote them after a non-null column-wide dtype
        // coercion. Postgres' integer columns reject "2.0"; strip the trailing ".0".
        static string? StripFloat(string? value)
        {
            if (string.IsNullOrEmpty(value)) return value;
            if (value.EndsWith(".0", StringComparison.Ordinal))
            {
                return value[..^2];
            }
            return value;
        }

        static string Escape(string? value)
        {
            if (string.IsNullOrEmpty(value)) return "\\N";
            return value
                .Replace("\\", "\\\\")
                .Replace("\n", "\\n")
                .Replace("\r", "\\r")
                .Replace("\t", "\\t");
        }
    }
}
