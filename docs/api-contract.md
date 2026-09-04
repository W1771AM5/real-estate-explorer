# Real Estate Explorer API Contract

All endpoints return JSON. The database the API reads from is the cleaned NY-House dataset (4,578 rows) loaded into the `Properties` table by `RealEstate.Loader`.

---

## Health Check

### `GET /api/health`

Liveness probe.

**Response 200**
```json
{ "status": "ok" }
```

---

## Properties

### `GET /api/properties`

Returns a page of property listings.

**Query parameters** (all optional)

| Name       | Type     | Description |
|------------|----------|-------------|
| `city`     | string   | Filter by `locality` (case-sensitive exact match, e.g. `New York`). |
| `zip`      | string   | Filter by 5-digit ZIP code (e.g. `10022`). |
| `minPrice` | decimal  | Inclusive lower bound on `price`. |
| `maxPrice` | decimal  | Inclusive upper bound on `price`. |
| `type`     | string   | Filter by `propertyType` (exact match). Allowed values: `Condo for sale`, `House for sale`, `Co-op for sale`, `Townhouse for sale`, `Multi-family home for sale`, `Land for sale`. |
| `status`   | string   | Filter by `listingStatus` (exact match). Allowed values: `For sale`, `Pending`, `Contingent`, `Coming Soon`, `Foreclosure`. |
| `take`     | int      | Maximum rows to return. Default `200`, hard-capped at `1000`. |
| `skip`     | int      | Rows to skip (offset pagination). Default `0`. |

**Response 200** — array of `PropertyDto` ordered by `id` ascending.

```json
[
  {
    "id": 1,
    "brokerTitle": "Brokered by Douglas Elliman -111 Fifth Ave",
    "propertyType": "Condo for sale",
    "listingStatus": "For sale",
    "price": 315000.00,
    "beds": 2,
    "baths": 2,
    "propertySqft": 1400,
    "address": "2 E 55th St Unit 803",
    "state": "New York, NY 10022",
    "zip": "10022",
    "administrativeAreaLevel2": "New York County",
    "locality": "New York",
    "sublocality": "Manhattan",
    "streetName": "East 55th Street",
    "longName": "Regis Residence",
    "formattedAddress": "Regis Residence, 2 E 55th St #803, New York, NY 10022, USA",
    "latitude": 40.761255,
    "longitude": -73.9744834
  }
]
```

Nullable fields (`propertyType`, `listingStatus`, `price`, `beds`, `baths`, `propertySqft`, `zip`, `administrativeAreaLevel2`, `locality`, `sublocality`, `streetName`, `longName`, `formattedAddress`, `latitude`, `longitude`) are `null` when the corresponding value was missing or redacted during cleanup.

### `GET /api/properties/{id}`

Returns one property by its database `id`.

**Path parameters**

| Name | Type | Description |
|------|------|-------------|
| `id` | int  | Property identifier (1..4578). |

**Response 200** — `PropertyDto` (same shape as the array element above).

**Response 404** — `{ "": "Not Found" }` when no row matches.

---

## CORS

The API allows requests from `http://localhost:5173` only. Other origins are rejected.

## Error shapes

ASP.NET Core's default ProblemDetails responses are used for non-2xx outcomes:
- `400` on malformed query parameters.
- `404` on missing properties.
- `500` on unexpected server errors.
