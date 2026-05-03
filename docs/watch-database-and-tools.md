# Watch Database, Comparison Tool, And Quiz

Durable handoff for the Google Sheet watch database and the planned database-backed site tools.

## Google Sheet

Spreadsheet: `TWR Watch Database`

URL: `https://docs.google.com/spreadsheets/d/1x35yr_MZoNsrMha0zfMB-wdpdQH_fjFHbk4U1y870MI/edit`

Tab: `Sheet1`

The Sheet is the working source of truth while the database is being collected. Later, it can be exported or transformed into JSON/content files for the static Astro site.

## Goals

### Watch Comparison Tool

Build a main comparison page where users can select two watches from the database. The selection UI can be either searchable autocomplete or dropdown-based.

After selecting two watches, generate a side-by-side comparison page or view using shared database fields:
- Brand, watch name, SKU, and product/source URL.
- Price and budget category.
- Case width, lug-to-lug, case height, movement, caliber, power reserve, and water resistance.
- Dial color, style, use case, formality, brand tier, wrist-size fit, and enthusiast appeal.
- Pros/cons when those fields are later populated editorially.

Because the site is static, prefer generating all known comparison routes at build time or using client-side selection against a bundled JSON file.

### Next Watch Quiz

Build a quiz for people looking for their next watch. The same database can power recommendations by matching user answers against controlled fields:
- Budget to `budget_category` and `price`.
- Wrist size to `case_width_mm`, `case_height_mm`, and `wrist_size_fit`.
- Intended use to `use_case`.
- Style preferences to `style`.
- Dial preference to `dial_color`.
- Dressiness preference to `formality`.
- Brand comfort/positioning to `brand_tier`.
- Buyer experience level to `enthusiast_appeal`.

The quiz should produce ranked recommendations, not a single hard filter, so it can still return useful results when a watch is imperfect but close.

## Schema

Columns in `Sheet1`:

| Column | Field |
|---|---|
| A | `brand` |
| B | `watch_name` |
| C | `slug` |
| D | `sku` |
| E | `source_url` |
| F | `price` |
| G | `case_width_mm` |
| H | `lug_to_lug_mm` |
| I | `case_height_mm` |
| J | `movement_type` |
| K | `caliber` |
| L | `power_reserve_hours` |
| M | `water_resistance_m` |
| N-R | `positive_1` through `positive_5` |
| S-W | `negative_1` through `negative_5` |
| X | `style` |
| Y | `use_case` |
| Z | `budget_category` |
| AA | `dial_color` |
| AB | `formality` |
| AC | `brand_tier` |
| AD | `wrist_size_fit` |
| AE | `enthusiast_appeal` |

## Controlled Values

`style` is a comma-list friendly dropdown:
`Diver`, `Dress`, `Field`, `Pilot`, `Chronograph`, `GMT`, `Integrated Bracelet`, `Everyday`, `Sports`, `Tool`, `Digital`, `Skeleton/Openworked`, `Military`, `Racing`, `Minimalist`, `Vintage-Inspired`, `Moonphase`, `Worldtimer`, `Dive Chronograph`

`use_case` is a comma-list friendly dropdown:
`Daily Wear`, `Office`, `Formal Events`, `Travel`, `Beach/Swimming`, `Diving`, `Outdoor/Adventure`, `Fitness/Sports`, `Collectors`, `First Serious Watch`, `Statement Piece`, `Under-the-Radar`, `Weekend/Casual`, `One-Watch Collection`, `Small Wrist Friendly`, `Large Wrist Friendly`

Strict dropdowns:

`budget_category`:
`Under $250`, `$250-$500`, `$500-$1,000`, `$1,000-$2,500`, `$2,500-$5,000`, `$5,000-$10,000`, `$10,000-$25,000`, `$25,000+`

`dial_color`:
`Black`, `White`, `Silver`, `Blue`, `Green`, `Gray`, `Champagne`, `Brown`, `Cream`, `Red`, `Orange`, `Yellow`, `Pink`, `Purple`, `Skeleton/Open`, `Mother of Pearl`, `Multicolor`

Normalize `Grey` to `Gray` and `Beige` to `Cream`.

`formality`:
`1 - Very Casual`, `2 - Casual`, `3 - Smart Casual`, `4 - Dressy`, `5 - Formal`

`brand_tier`:
`Entry`, `Affordable`, `Microbrand`, `Enthusiast`, `Premium`, `Luxury`, `High Luxury`, `Haute Horology`

`wrist_size_fit`:
`1 - Best for small wrists`, `2 - Small to average wrists`, `3 - Average wrists`, `4 - Average to large wrists`, `5 - Best for large wrists`

`enthusiast_appeal`:
`1 - Mainstream / casual buyer`, `2 - Beginner-friendly`, `3 - Enthusiast-approved`, `4 - Collector-interest`, `5 - Serious collector / niche appeal`

## Import Rules

- Crawl brand collection pages only when the owner provides a collection link or explicit target set.
- Include paginated collection pages when requested.
- Skip unavailable/out-of-stock watches unless the owner explicitly says to include them.
- Skip named exclusions from the owner, such as "ignore watches named Alliance."
- Always include product URLs in `source_url`.
- Prefer official product pages or official product APIs for factual specs.
- Normalize water resistance to meters only, e.g. `10 bar (100m)` or `10 ATM/100 M/330 FT` becomes `100`.
- Do not convert quartz battery life into `power_reserve_hours`.
- Leave `lug_to_lug_mm` blank when it is not directly provided.
- Leave pros/cons blank during factual imports unless editorial review notes are available.
- Use controlled dropdown values exactly, especially in strict columns.

## Completed Imports

### Hamilton

Rows `2-48`: Khaki Aviation, 47 rows.

Rows `49-78`: Khaki Navy, 30 in-stock rows.

Rows `79-95`: American Classic subset, 17 in-stock rows. Owner requested only:
`Intra-Matic Auto`, `Day Date Auto`, `Pan Europ`.

Rows `96-164`: Khaki Field, 69 in-stock rows from 5 collection pages.

Hamilton import notes:
- Product URLs are included.
- Water resistance values were normalized to meters.
- Out-of-stock Khaki Field watches were skipped once the skip rule was established.

### Victorinox

Rows `165-248`: Victorinox men's watches, 84 in-stock rows.

Source collection:
`https://www.victorinox.com/en/Products/Watches/Men's-Watches/c/TP-mens-watches/?maxResults=90`

Victorinox import notes:
- Owner asked to ignore watches named `Alliance`.
- The collection returned 90 items.
- No `Alliance` watches appeared in the returned product set.
- 6 out-of-stock watches were skipped:
  `242029`, `241682.1`, `241930`, `241978`, `241849`, `241902`.
- Specs were extracted from official Victorinox product-page data.
- `lug_to_lug_mm` is blank because Victorinox provides lug width, not lug-to-lug.
- `power_reserve_hours` is blank because quartz/solar battery life was not converted into power reserve hours.

### Norqain

Rows `249-260`: Norqain Wild ONE, 12 in-stock rows.

Source collection:
`https://norqain.com/collections/wild-one`

Norqain import notes:
- Owner asked to skip limited editions.
- Limited Edition watches were skipped, including the Wild ONE Skeleton Chrono Limited Edition, Red Gold Limited Edition, Mint Limited Edition, Yellow Gold Limited Edition, and X-Lite Limited Edition.
- Sold-out and pre-order watches were skipped under the standing unavailable-watch rule.
- The Wild ONE Meteorite Special Edition was included because it is listed as a Special Edition, not a Limited Edition, and was in stock.
- Specs were extracted from official Norqain product pages.
- `lug_to_lug_mm` was available from Norqain and populated.
- Prices are entered as the official numeric prices shown by Norqain, which defaulted to CHF on the official site.

Rows `261-266`: Norqain Adventure Sport Gents, 6 in-stock rows.

Source collection:
`https://norqain.com/collections/adventure-sport-gents`

Norqain Adventure Sport import notes:
- The collection page included unrelated recommendation links near the top; only the Adventure Sport Gents collection products were imported.
- Limited Edition watches were included for this collection because the owner did not request a limited-edition exclusion here.
- The Adventure NEVEREST GMT Glacier Grey & Gold was skipped because the official product schema showed `OutOfStock`.
- Specs were extracted from official Norqain product pages.
- `lug_to_lug_mm` was available from Norqain and populated.
- Prices are entered as the official numeric prices shown by Norqain, which defaulted to CHF on the official site.

## Implementation Notes For Later

When moving from Sheet to site:
- Create a repeatable Sheet-to-JSON export script or manual export workflow.
- Validate row data before build so strict fields do not drift.
- Consider a content collection or plain JSON module depending on how many pages are generated.
- For comparison pages, add a canonical URL strategy before generating many pairwise routes.
- For the quiz, start with a scoring function that awards weighted points rather than using hard filters only.
