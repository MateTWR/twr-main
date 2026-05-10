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
- Editorial pros/cons were added for rows `2-164`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Hamilton editorial pass used a controlled family/spec-based approach across the large variant set, with claims grounded in model family, movement type, size, power reserve, water resistance, and style fields rather than hands-on impressions.

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
- Editorial pros/cons were added for rows `165-248`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Victorinox editorial pass used a controlled family/spec-based approach across the large variant set, with claims grounded in product family, movement type, case size, water resistance, and use case rather than hands-on impressions.

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

Rows `267-270`: Norqain Freedom 60, 4 in-stock rows.

Source collection:
`https://norqain.com/collections/freedom60`

Norqain Freedom 60 import notes:
- The collection page included unrelated recommendation links near the top; only the Freedom 60 collection products were imported.
- The Freedom Chrono Enjoy Life "Ice Cream", Freedom Chrono Limited Edition, and Freedom GMT Ice Blue were skipped because the official product schema showed `OutOfStock`.
- Specs were extracted from official Norqain product pages.
- `lug_to_lug_mm` was available from Norqain and populated.
- Prices are entered as the official numeric prices shown by Norqain, which defaulted to CHF on the official site.
- Editorial pros/cons were added for rows `249-270`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Norqain editorial pass was written watch-by-watch because the block was small enough to handle individually, while still grounding claims in official specs and database fields.

### Benrus

Rows `271-284`: Benrus watches, 14 in-stock rows.

Source collection:
`https://benrus.com/en-us/collections`

Benrus import notes:
- The collection page exposed 14 watch entries.
- The Sky Chief appeared as two separate dial variants in the collection and was imported as two rows: Stratus Grey and Cirrus White.
- All visible collection watches were add-to-cart available at import time, so no watches were skipped.
- Specs were extracted from official Benrus product pages.
- `lug_to_lug_mm` was available from Benrus and populated.
- Water resistance was normalized to meters. Benrus Type 1 MIL SPEC and Type 2 MIL SPEC list `36.5 ATM / 1200 feet`; these were entered as `365`.
- Prices are entered as the official numeric USD prices shown on the Benrus `en-us` site.
- Editorial pros/cons were added for rows `271-284` as a tone-test pass, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Benrus editorial pass was based on existing TWR Benrus coverage and guide language, but kept claims grounded in database specs rather than hands-on impressions for unreviewed models.

### Vaer

Rows `285-360`: Vaer watches, 76 collection products.

Source collection:
`https://www.vaerwatches.com/collections/all-watches-1`

Vaer import notes:
- Owner asked to include every collection watch, including out-of-stock models, because they may return.
- The visible collection has pagination, but the Shopify product feed returned 76 products on page 1 and an empty page 2 feed, so all collection products were captured in the import.
- Product URLs are included.
- Specs were extracted from official Shopify product data and accessible Vaer product-page specification accordions.
- Some Vaer product pages returned a Cloudflare challenge during import. For those rows, same-family specs were used only when established from accessible official Vaer pages; uncertain fields, including some case heights, lug-to-lug values, and the A12 caliber, were left blank rather than guessed.
- Water resistance values were normalized to meters.
- Prices are entered as official numeric USD prices from the collection/product data.
- Editorial pros/cons were added for rows `285-360`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Vaer editorial pass used existing TWR Vaer style and preferences, emphasizing the brand's practical sizing, tool-watch value, USA-assembly identity, and movement tradeoffs while keeping claims grounded in official specs and database fields.

### Laco

Rows `361-368`: Laco watches, 8 owner-provided product URLs.

Source products:
- `https://www.laco-watches.com/en/watches/flieger-pro/karlsruhe-pro/862142`
- `https://www.laco-watches.com/en/watches/flieger-pro/stuttgart-pro/862141`
- `https://www.laco-watches.com/en/watches/classics/plauen-40/861860`
- `https://www.laco-watches.com/en/watches/classics/brandenburg-40/861859`
- `https://www.laco-watches.com/en/watches/editions/stuttgart-pro-watchtime-edition/852141-1`
- `https://www.laco-watches.com/en/watches/editions/prolab/862193`
- `https://www.laco-watches.com/en/watches/pilot-watches-din-8330/hamburg-gmt-din-8330/862165`
- `https://www.laco-watches.com/en/watches/pilot-watches-din-8330/hamburg-din-8330/862164`

Laco import notes:
- Specs were extracted from official Laco product pages and embedded product data.
- Product URLs are included.
- Water resistance values were normalized to meters.
- Prices are entered as official numeric USD prices exposed in Laco product data.
- The Karlsruhe PRO and Stuttgart PRO pages are configurable products with 37 mm, 40 mm, and 43 mm case options. The sheet uses the 40 mm/default mid-size specs because the current schema only supports one numeric value per measurement.
- The ProLab product page includes variant-specific specs. The sheet uses the primary ProLab Sand specs from the product data, while noting the variant caveat in the editorial negatives.
- Editorial pros/cons were added for rows `361-368`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco editorial pass used existing TWR Laco coverage, especially the Laco brand review, the Karlsruhe PRO pilot-watch guide entry, and the Hamburg DIN 8330 hands-on review.

Rows `369-376`: Laco Navy watches, 8 in-stock rows.

Source collection:
`https://www.laco-watches.com/en/watches/navy-watches`

Laco Navy import notes:
- The Navy collection exposed 8 product rows: Cuxhaven, Bremerhaven, Valencia, and Casablanca in two sizes each.
- All 8 product pages exposed `InStock` structured data at import time, so no watches were skipped.
- Specs were extracted from official Laco product pages and embedded product data.
- Product URLs are included.
- Water resistance values were normalized to meters.
- Prices are entered as official numeric USD prices exposed in Laco product data.
- Power reserve is blank because the Laco Navy product pages did not expose power-reserve values in the parsed official specs.
- Editorial pros/cons were added for rows `369-376`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco Navy editorial pass used the existing TWR Laco brand review's maritime-watch language and kept claims grounded in the official case, movement, water-resistance, and dial specs.

Rows `377-383`: Laco Chronographs, 7 in-stock rows.

Source collection:
`https://www.laco-watches.com/en/watches/chronographs`

Laco Chronographs import notes:
- The Chronographs collection exposed 7 product rows: six Kiel.2 variants and Kiel Sport.
- All 7 product pages exposed `InStock` structured data at import time, so no watches were skipped.
- Specs were extracted from official Laco product pages and embedded product data.
- Product URLs are included.
- Water resistance values were normalized to meters.
- Prices are entered as official numeric USD prices exposed in Laco product data.
- Power reserve is blank because the Laco Chronographs product pages did not expose power-reserve values in the parsed official specs.
- Bracelet variants with `.MB` SKUs were imported as separate rows because Laco lists them as separate collection products with distinct URLs and prices.
- Editorial pros/cons were added for rows `377-383`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco Chronographs editorial pass used the existing TWR Laco brand review's chronograph language and kept claims grounded in official case, movement, water-resistance, dial, strap, and price data.

Rows `384-420`: Laco Pilot Watch Original, 37 visible collection rows.

Source collection:
`https://www.laco-watches.com/en/watches/pilot-watch-original`

Laco Pilot Watch Original import notes:
- The collection page exposed `Showing 37 products`; only those visible product cards were imported. Extra Original links elsewhere in the HTML were treated as navigation/cross-links and not imported.
- The batch includes standard Original, Erbstück, 39 mm/42 mm variants, and Memmingen Blaue Stunde rows visible on the collection page.
- Specs were extracted from official collection card data and representative official Laco product pages/embedded product data. Shared family specs were used across matching Original sizes and movement families.
- Product URLs are included.
- Water resistance values were normalized to meters.
- Prices are entered as official numeric USD prices exposed in Laco collection/product data.
- Power reserve is blank because the parsed official Original product data did not expose power-reserve values.
- `lug_to_lug_mm` and `case_height_mm` for the 39 mm Original rows use same-family sizing patterns because representative 39 mm pages could not be fetched during import after transient DNS/curl resolution failures.
- Editorial pros/cons were added for rows `384-420`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco Pilot Watch Original editorial pass used existing TWR Laco brand review language around original flieger heritage, historical authenticity, Erbstück aging, and the tradeoff between authentic sizing and daily wearability.

Rows `421-444`: Laco Sport Watches, 24 in-stock rows.

Source collection:
`https://www.laco-watches.com/en/watches/sport-watches`

Laco Sport Watches import notes:
- The Sport Watches collection exposed 29 visible product cards.
- The Aleutian, Kilimanjaro, Malawi, Mariana, and Daintree rows were skipped because the collection cards marked them sold out.
- The imported rows cover the in-stock Scorpion models across Amazonas, Atlantik, Mojave, and Himalaya families in 39 mm and 42 mm sizes, including standard rubber-strap, metal-bracelet `.MB`, and colored-rubber `.RB` variants.
- Specs were extracted from official Laco collection card data and representative official Laco product pages/embedded product data.
- Product URLs are included.
- Water resistance was normalized from `30 ATM` to `300`.
- Prices are entered as official numeric USD prices exposed in Laco collection/product data.
- Power reserve is blank because the parsed official Sport Watches product data did not expose power-reserve values.
- Shared same-family specs were used across matching Sport/Scorpion size and strap families where the official product pages exposed the same case architecture.
- Editorial pros/cons were added for rows `421-444`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco Sport Watches editorial pass used existing TWR Laco language while emphasizing the collection's practical Scorpion/tool-watch identity, 30 ATM water resistance, black sport styling, and Sellita-based movement tradeoff.

Rows `445-449`: Laco Squad Watches, 5 in-stock rows.

Source collection:
`https://www.laco-watches.com/en/watches/squad-watches`

Laco Squad Watches import notes:
- The Squad Watches collection exposed `Showing 5 products`; duplicate product-card HTML later in the page was treated as a repeated slider/listing block and not imported twice.
- All 5 visible collection products were imported because none were marked sold out or unavailable.
- The imported rows are Atacama.3, Atacama.3 MB, Atacama Quarz UTC, Atacama Quarz UTC MB, and Seven Seas.
- Specs were extracted from official Laco collection card data and official product pages/embedded product data.
- Product URLs are included.
- Water resistance values were normalized from `50 ATM`, `20 ATM`, and `100 ATM` to `500`, `200`, and `1000`.
- Prices are entered as official numeric USD prices exposed in Laco collection/product data.
- Power reserve is blank because the parsed official Squad Watches product data did not expose power-reserve values.
- Editorial pros/cons were added for rows `445-449`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco Squad Watches editorial pass used existing TWR Laco language, especially the Atacama Quartz UTC review's emphasis on professional-tool ergonomics, articulated lugs, 12 o'clock crown design, quartz practicality, and the tradeoff between intimidating specs and real-world wearability.

Rows `450-458`: Laco Pilot Watches Special Models, 9 new in-stock rows.

Source collection:
`https://www.laco-watches.com/en/watches/pilot-watches-special-models`

Laco Pilot Watches Special Models import notes:
- The collection exposed `Showing 16 products`.
- All 16 visible collection products were in stock at import time.
- 7 Kiel chronograph rows were skipped because those SKUs/source URLs were already imported during the Laco Chronographs batch: `862148`, `862148.MB`, `862153`, `862153.MB`, `862186`, `862186.MB`, and `862180`.
- The imported rows are Köln, Köln MB, Köln Grau, Frankfurt GMT Schwarz, Frankfurt GMT Grau, Ulm 42.5, Würzburg 42.5, Ulm 39, and Würzburg 39.
- Specs were extracted from official Laco collection card data and official product pages/embedded product data.
- Product URLs are included.
- Water resistance values were normalized from `20 ATM` and `10 ATM` to `200` and `100`.
- Prices are entered as official numeric USD prices exposed in Laco collection/product data.
- Power reserve is blank except for the Frankfurt GMT rows, where the existing TWR Frankfurt GMT review documents the Laco 330/Sellita SW330-2 power reserve as 56 hours.
- Editorial pros/cons were added for rows `450-458`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco Special Models editorial pass used existing TWR Laco language, especially the Frankfurt GMT review's framing around modern pilot-watch design, dark sandblasted case finishing, GMT practicality, and Laco's underrated tool-watch engineering.

Rows `459-497`: Laco Pilot Watches Basic, 39 in-stock rows.

Source collection:
`https://www.laco-watches.com/en/watches/pilot-watches-basic`

Laco Pilot Watches Basic import notes:
- The collection exposed `Showing 40 products`.
- 1 visible collection product was skipped because it was marked `discontinued`: Aachen Grün 39, SKU `862190`.
- No visible Basic collection SKUs/source URLs duplicated prior Laco imports.
- The imported rows include the in-stock Augsburg, Aachen, Neapel, Palermo, Altenburg, Bielefeld, Genf.2, and Zürich.2 Basic models and bracelet variants.
- Specs were extracted from official Laco collection card data and official product pages/embedded product data. Shared same-family specs were used across matching 39mm, 40mm, 42mm, strap, and bracelet variants where Laco exposed the same case architecture.
- Product URLs are included.
- Water resistance was normalized from `5 ATM` to `50`.
- Prices are entered as official numeric USD prices exposed in Laco collection/product data.
- Power reserve is blank because the automatic pages did not expose power-reserve values and the quartz rows should not use battery life as power reserve.
- Editorial pros/cons were added for rows `459-497`, using three positive and three negative one-sentence fields per watch. `positive_4`, `positive_5`, `negative_4`, and `negative_5` were intentionally left blank.
- The Laco Basic editorial pass used existing TWR Laco language while emphasizing accessible flieger design, Type A/Type B dial differences, simple Miyota/Ronda-based ownership, 5 ATM limitations, and the gap between the Basic line and Laco's Original/PRO collections.

### Circula

Rows `498-584`: Circula all watches collection, 87 visible product-card rows.

Source collection:
`https://circulawatches.com/us/watches/all-watches/?show=all`

Circula import notes:
- The all-watches collection exposed 87 distinct visible product-card URLs in the parsed collection page.
- No visible product card was marked discontinued or out of stock at import time; `Final models in stock` rows were treated as available and imported.
- Strap, bracelet, bezel, and clasp variants were imported as separate rows when Circula listed them as separate product cards with distinct SKUs/source URLs.
- Specs were extracted from official Circula collection card data and representative official product pages/property tables for the ProTrail, ProFlight, DiveSport Titanium, AquaSport II, AquaSport GMT, SuperSport, ProSea, Facet, and ProLab families.
- Shared same-family specs were used across matching dial/strap/bracelet variants where official product pages exposed the same case architecture and movement family.
- Product URLs are included.
- Water resistance was normalized from `10 ATM`, `15 ATM`, `20 ATM`, `30 ATM`, and `50 ATM` to `100`, `150`, `200`, `300`, and `500`.
- Prices are entered as official numeric USD prices exposed in Circula collection/product data.
- Power reserve values are entered from official product page/property tables: 41 hours for SW200-1 families, 56 hours for AquaSport GMT/SW330-2, and 68 hours for Facet/La Joux-Perret G100.
- `positive_1` through `negative_5` were intentionally left blank for this factual import pass; Circula has existing TWR editorial context that can support a separate pros/cons pass later.
- Dial colors were normalized to controlled database values; `Petrol` and `Turquoise` were mapped to `Blue`, `Anthracite` and `Grey` to `Gray`, and `Sand` to `Cream`.

### Spinnaker

Rows `585-706`: Spinnaker all-watches/view-all collection, 122 available product rows.

Source collection:
`https://spinnaker-watches.com/collections/view-all`

Spinnaker import notes:
- The Shopify collection product feed exposed 140 products for the `view-all` collection.
- 122 available products were imported and 18 unavailable/out-of-stock products were skipped under the standing unavailable-watch rule.
- Product pages were fetched for all imported rows and official Spinnaker specification blocks were used for movement description, case size, lug-to-lug, case thickness, dial color, water resistance, and product URLs.
- Product URLs are included.
- Water resistance was normalized from ATM to meters, e.g. `10 ATM`, `15 ATM`, `18 ATM`, `20 ATM`, `30 ATM`, and `55 ATM` became `100`, `150`, `180`, `200`, `300`, and `550`.
- Prices are entered as official numeric USD prices exposed by the Shopify product data at import time, including sale prices where the product feed exposed them as the active price.
- Caliber and power reserve were populated from official product-page feature/spec text when exposed. Caliber was left blank where Spinnaker did not expose a specific movement caliber in the parsed official product page.
- Product rows use `Vendor + title` as `watch_name` because many Spinnaker product titles are dial/color names and the Shopify `vendor` field carries the family name.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.
- Controlled fields were normalized from official specs, product titles, tags, and product-family context while keeping strict dropdown values valid.

### VERO

Rows `707-714`: VERO all watches collection, 8 available product-card rows.

Source collection:
`https://vero-watch.com/collections/all-watches`

VERO import notes:
- The Shopify collection product feed exposed 16 products for the all-watches collection.
- 8 available product-card rows were imported and 8 fully sold-out products were skipped under the owner's request.
- Product pages were fetched for all imported rows and official VERO specification sections were used for movement, case width, lug-to-lug, case height, water resistance, and product URLs.
- Product URLs are included.
- Multi-variant products were imported as one product-card row using the first available/base watch variant SKU and price, rather than separate strap-add-on rows.
- Water resistance was normalized from official feet/meters copy to meters.
- Prices are entered as official numeric USD prices exposed by the Shopify product data at import time.
- The Limited Edition One Moto Solar lists a 4-month solar reserve, but `power_reserve_hours` was left blank to stay consistent with the database convention of not converting solar/battery-life reserve into mechanical power-reserve hours.
- The VERO X Wildwood Studio Edition product copy includes conflicting water-resistance language; the sheet uses the value from the product page's structured `CASE + COMPONENTS` spec section.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Sternglas

Rows `715-746`: Sternglas all-watches collection, 32 filtered product-card rows.

Source collection:
`https://www.sternglas.com/collections/all-watches`

Sternglas import notes:
- The Shopify collection product feed exposed 83 products for the all-watches collection.
- Owner asked to skip products labeled for women, products with `clock` in the product name, products labeled `last chance`, and products labeled `limited`.
- After those filters, 32 product-card rows were imported.
- The filtered collection did not expose any `last chance` or `limited` labels at import time; most exclusions came from `Gender_Women`/`women` tags and clock product names.
- Product pages were fetched for all imported rows and official Sternglas product spec tables were used for case diameter, lug-to-lug, case height, movement, caliber, power reserve, water resistance, and product URLs.
- Product URLs are included.
- Multi-variant products were imported as one product-card row using the first available/base watch variant SKU and price, rather than separate strap/bracelet variant rows.
- Water resistance was normalized from ATM to meters.
- Prices are entered as official numeric prices exposed by the Shopify product data at import time.
- Products tagged as `Special Edition` were included because the exclusion request was for `limited`, not special editions.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Mido

Rows `747-854`: Mido men's Ocean Star and Multifort collection SKUs, 108 rows.

Source collections:
- `https://www.midowatches.com/us/watches/collections/ocean-star.html`
- `https://www.midowatches.com/us/watches/collections/multifort.html`

Mido import notes:
- Owner requested all SKUs from the men's Ocean Star and Multifort collections, excluding Baroncelli and Commander completely.
- Collection pages exposed 111 product cards across Ocean Star and Multifort.
- 108 rows were imported after filtering to product-card data where gender included `Men`; 3 women-only Ocean Star 36.5 rows were skipped.
- Product pages were fetched for all imported rows and official Mido technical-spec sections were used for model number, price, case width, case thickness, movement, power reserve, water resistance, dial color, and product URLs.
- Product URLs are included.
- `lug_to_lug_mm` is blank because Mido exposes case length and width, not lug-to-lug.
- User asked to import all SKUs, so rows include Mido products even when the product page showed `Get Notified`/currently out of stock rather than direct online availability.
- Water resistance was normalized from official bar/meter values to meters.
- Caliber was normalized to Mido family-level caliber language where Mido's product pages expose only `MIDO Automatic ETA`: Ocean Star 39 rows use `MIDO Caliber 72`, standard automatic rows use `MIDO Caliber 80`, automatic chronograph rows use `MIDO automatic chronograph`, and quartz chronograph rows use `MIDO quartz`.
- Prices are entered as official numeric USD prices exposed by the Mido product-card data at import time.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Rado

Rows `855-896`: Rado Captain Cook collection, 42 filtered product rows.

Source collection:
`https://www.rado.com/en_us/watches/all-our-collections/captain-cook.html`

Rado import notes:
- Owner asked to import only the Captain Cook collection and leave out 37 mm models and gold-tone models.
- Rado's category page exposed 48 Captain Cook product rows through the official product index.
- 42 rows were imported after filtering out 6 rows: 4 rows because they were 37 mm, 1 row because it had yellow-gold/gold-tone bracelet data, and 1 row because it was both 37 mm and gold-tone.
- Product pages were fetched for all imported rows and official Rado product-page specification sections were used for price, case width, case thickness, movement type, caliber, power reserve, and product URLs.
- Product URLs are included.
- `lug_to_lug_mm` is blank because Rado does not expose lug-to-lug in the parsed official product specifications.
- Water resistance is entered as `300` for the imported Captain Cook rows. Rado exposes this directly in product copy for many rows; for rows where the same product-page spec section did not repeat it, the Captain Cook collection-family value was used.
- Dial color is populated only where Rado exposed it through product-page specs or product-index data; rows with no reliable official dial-color value were left blank.
- Prices are entered as official numeric USD prices exposed by Rado's product index at import time.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Le Forban

Rows `897-913`: Le Forban product pages, 17 variant rows.

Source product pages:
- `https://leforbansecuritemer.com/en/la-marseillaise/`
- `https://leforbansecuritemer.com/en/la-rochelaise/`
- `https://leforbansecuritemer.com/en/la-brestoise/`
- `https://leforbansecuritemer.com/en/la-malouine/`
- `https://leforbansecuritemer.com/en/la-omaha/`

Le Forban import notes:
- Owner provided individual product pages and noted that each page contains multiple color variations without URL changes.
- The product pages expose WooCommerce variation IDs, variation titles, strap/bracelet labels, prices, and stock snippets in the page HTML; those variation IDs were used as unique `sku` values with the `LFSM-` prefix because public retail SKU/reference numbers were not exposed.
- 17 rows were imported: 5 La Marseillaise variants, 6 La Rochelaise variants, 2 La Brestoise variants, 2 La Malouine variants, and 2 La Omaha variants.
- Product URLs are included, using the shared product-family URL for each variant because the visible URL does not change by selected color/strap.
- Prices are entered as approximate USD values converted from official EUR prices shown on the Le Forban pages at import time, using an exchange rate of `1 EUR = 1.1752 USD` and rounded to whole dollars so the database stays comparable with the rest of the price column.
- Product specs were extracted from official page specification sections and technical-detail copy for case width, lug-to-lug, case height, movement, caliber, power reserve, and water resistance.
- La Omaha has conflicting water-resistance copy on the page; the row uses `50` meters from the longer technical-details section and explanatory product copy rather than the compact spec block.
- `positive_1` through `negative_5` were intentionally left blank for this factual import pass because there is no Le Forban TWR editorial context yet.

### Yema

Rows `914-957`: Yema `all-superman` collection, 44 filtered watch-configuration rows.

Source collection:
`https://yema.us/collections/all-superman`

Yema import notes:
- The collection page exposed 26 product-card handles.
- Product JSON and product-page HTML were fetched for all 26 product cards.
- 44 rows were imported after filtering product variants down to watch configurations.
- 23 `LIKE NEW` condition variants were skipped because they duplicate the same watch/SKU as used-condition listings.
- 6 rubber strap `L` length variants were skipped where the same watch configuration also had an `S` strap-length variant; strap length was treated as a fit/accessory choice rather than a distinct watch configuration.
- Product URLs are included.
- Rows include the products exposed by the linked `all-superman` collection, including adjacent Yema dive models surfaced by that collection page such as Skin Diver and Granvelle.
- `lug_to_lug_mm` is blank because Yema exposes lug width in the product specifications, not lug-to-lug distance.
- Product-page specification sections were used for case width, case height, movement type, caliber, power reserve, and water resistance.
- Prices are entered as official numeric USD prices exposed by Yema's Shopify product data at import time.
- Dial colors were normalized from product titles, handles, and official product image filenames into the database's controlled color values. Rows where the official source did not expose a reliable dial color were left blank.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `958-973`: Yema `all-navygraf` collection, 16 filtered watch-configuration rows.

Source collection:
`https://yema.us/collections/all-navygraf`

Yema Navygraf import notes:
- The collection page exposed 12 product-card handles.
- Product JSON and product-page HTML were fetched for all 12 product cards.
- 16 rows were imported after filtering product variants down to watch configurations.
- 4 `LIKE NEW` condition variants were skipped because they duplicate the same watch/SKU as used-condition listings.
- 1 sold-out Navygraf Marine Nationale GMT Paris variant was skipped under the standard unavailable-watch import rule.
- Product URLs are included.
- `lug_to_lug_mm` is blank because Yema exposes lug width in the product specifications, not lug-to-lug distance.
- Product-page specification sections were used for case width, case height, movement type, caliber, power reserve, and water resistance.
- Prices are entered as official numeric USD prices exposed by Yema's Shopify product data at import time.
- Dial colors were normalized from product-page dial text, product handles, and official product image filenames into the database's controlled color values.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `974-985`: Yema `all-wristmaster` collection, 12 filtered watch-configuration rows.

Source collection:
`https://yema.us/collections/all-wristmaster`

Yema Wristmaster import notes:
- The collection page exposed 9 product-card handles.
- Product JSON and product-page HTML were fetched for all 9 product cards.
- 12 rows were imported after filtering product variants down to watch configurations.
- 2 `LIKE NEW` condition variants were skipped because they duplicate the same watch/SKU as used-condition listings.
- Product URLs are included.
- Rows include the Wristmaster Slim CMM.20/CMM.29 models plus Urban Traveller models surfaced by the linked Wristmaster collection page.
- `lug_to_lug_mm` is blank because Yema exposes lug width in the product specifications, not lug-to-lug distance.
- Product-page specification sections were used for case width, case height, movement type, caliber, power reserve, and water resistance.
- Prices are entered as official numeric USD prices exposed by Yema's Shopify product data at import time.
- Dial colors were normalized from product-page dial text, product handles, and official product image filenames into the database's controlled color values.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `986-993`: Yema `all-flygraf` collection, 8 filtered watch-configuration rows.

Source collection:
`https://yema.us/collections/all-flygraf`

Yema Flygraf import notes:
- The collection page exposed 6 product-card handles.
- Product JSON and product-page HTML were fetched for all 6 product cards.
- 8 rows were imported after filtering product variants down to watch configurations.
- 1 `LIKE NEW` condition variant was skipped because it duplicates the same watch/SKU as a used-condition listing.
- Product URLs are included.
- `lug_to_lug_mm` is blank because Yema exposes lug width in the product specifications, not lug-to-lug distance.
- Product-page specification sections were used for case width, case height, movement type, caliber, power reserve, and water resistance.
- Power reserve was left blank for quartz and meca-quartz rows where the product page does not provide a mechanical power-reserve spec.
- Prices are entered as official numeric USD prices exposed by Yema's Shopify product data at import time.
- Dial colors were normalized from product-page dial text, product handles, and official product image filenames into the database's controlled color values.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `994-1009`: Yema `all-rallygraf` collection, 16 watch-configuration rows.

Source collection:
`https://yema.us/collections/all-rallygraf`

Yema Rallygraf import notes:
- The sheet grid was expanded from 997 rows to 1017 rows before this import.
- The collection page exposed 9 product-card handles.
- Product JSON and product-page HTML were fetched for all 9 product cards.
- 16 rows were imported after expanding strap/bracelet variants into distinct watch configurations.
- No unavailable, sold-out, or `LIKE NEW` variants were exposed in the imported product JSON.
- Product URLs are included.
- `lug_to_lug_mm` is blank because Yema exposes lug width in the product specifications, not lug-to-lug distance.
- Product-page specification sections were used for case width, case height, movement type, caliber, power reserve, and water resistance.
- Power reserve was left blank for meca-quartz rows where the product page does not provide a mechanical power-reserve spec.
- Prices are entered as official numeric USD prices exposed by Yema's Shopify product data at import time.
- Dial colors were normalized from product-page dial text, product handles, and official product image filenames into the database's controlled color values.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `1010-1011`: Missing Yema Granvelle CMM.29 green and black color variations.

Source product family:
`https://yema.us/products/yema-granvelle-cmm-20-70-25-29-05-sn-l8`

Yema Granvelle import notes:
- The blue Granvelle CMM.29 was already imported at row `914` from the earlier Yema `all-superman` import.
- The linked product page exposes sibling product handles for the green and black Granvelle color variations.
- Product JSON and product-page HTML were fetched for the two missing sibling handles.
- 2 rows were imported: green (`70.25.29.04.SN.L8`) and black (`70.25.29.09.SN.L8`).
- The blue page's `LIKE NEW` duplicate variant was skipped because row `914` already captures the new blue watch configuration.
- Product URLs are included per color variation.
- `lug_to_lug_mm` is blank because Yema exposes lug width in the product specifications, not lug-to-lug distance.
- Product-page specification sections were used for case width, case height, movement type, caliber, power reserve, and water resistance.
- Prices are entered as official numeric USD prices exposed by Yema's Shopify product data at import time.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Unimatic

Rows `1012-1035`: Unimatic watches collection, 24 product-card rows.

Source collection:
`https://www.unimaticwatches.com/watches/`

Unimatic import notes:
- The collection page reported 26 products, but the downloaded catalog HTML exposed 24 unique product URLs; page 2 duplicated the same product-card set at import time.
- Product pages were fetched for all 24 unique product URLs.
- 24 rows were imported for the visible product cards, including Classic, Toolwatch, limited-edition, and collaboration models.
- Product URLs are included.
- Product JSON-LD was used for SKU, USD price, and availability where available.
- Product-page specification sections were used for case width, movement type, caliber, power reserve, and water resistance.
- `lug_to_lug_mm` and `case_height_mm` are blank because Unimatic exposes lug width and crystal thickness in the fetched specification text, not lug-to-lug distance or overall case height.
- Direct USD price and budget category are blank for limited/collaboration rows where the product page did not expose a direct USD offer price.
- Power reserve is populated for mechanical rows and left blank for quartz and meca-quartz rows.
- Dial colors were normalized from official product-page dial text into the database's controlled color values.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Maen

Rows `1036-1079`: Maen collections hub and linked watch collections, 44 available watch-configuration rows.

Source collection hub:
`https://www.maenwatches.com/en-us/collections`

Maen import notes:
- The collections hub exposed 12 watch collection links plus product cards; the accessories collection was skipped.
- Product links were gathered from the hub and the linked watch collection pages, producing 53 unique product URLs.
- Shopify product JSON and product-page HTML were fetched for each product URL.
- 44 rows were imported after applying the standard unavailable-watch rule.
- 9 unavailable products were skipped: Grand Tonneau Jump Hour MNL.01-MNL.03, Grand Tonneau Ultra Thin MNL.05/MNL.06/MNL.08, Lunar Classic M7.1.3, and Skymaster M6.2.2/M6.2.4.
- Product URLs are included.
- Shopify product JSON was used for SKU, USD price, and availability.
- Product-page specification sections were used for case width, lug-to-lug distance, case height, movement type, caliber, water resistance, and dial color.
- Power reserve was populated only where the product page or clearly identified caliber supported it directly enough for this pass, primarily La Joux-Perret G100 rows and the Lunar Classic Sellita SW280-1 rows; otherwise it was left blank.
- Dial colors were normalized from Maen's official dial-color specification text into the database's controlled color values.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Traska

Rows `1080-1084`: Traska Summiteer 38 mm models, 5 rows imported by owner exception.

Rows `1085-1088`: Traska Freediver models, 4 rows imported by owner exception.

Rows `1089`: Traska Chronograph Tungsten Gray.

Rows `1090-1093`: Traska Commuter 38 mm models, 4 rows imported by owner exception.

Rows `1094-1097`: Traska Venturer GMT models, 4 rows imported.

Source collection:
`https://www.traskawatch.com/collections/freediver`

Traska Freediver import notes:
- The Freediver collection exposed 4 product-card rows in Shopify collection JSON: Carbon Black, Arctic White, Chaouen Blue, and Hunter Green.
- The standard unavailable-watch rule was overridden for this collection after owner follow-up; all 4 unavailable Freediver models were imported.
- Product URLs are included.
- Shopify collection/product JSON was used for SKU, USD price, and availability.
- Product-page text and official spec/dimension images were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The no-date variants were imported from the primary product-card variant/SKU; the page notes date variants use Miyota 9019, but the imported `NDT` rows use Miyota 9039.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://www.traskawatch.com/collections/summiteer-collection`

Traska Summiteer import notes:
- The Summiteer collection exposed 10 product-card rows in Shopify collection JSON: five 36 mm models and five 38 mm models.
- The owner asked to leave out 36 mm models.
- The standard unavailable-watch rule was overridden for this collection after owner follow-up; all 5 unavailable 38 mm models were imported.
- The only available Summiteer variant at import time was the 36 mm Oxblood Red, which was still excluded by the requested size filter.
- Product URLs are included.
- Shopify collection/product JSON was used for SKU, USD price, and availability.
- Product-page text and official spec/dimension images were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source product:
`https://www.traskawatch.com/products/chronograph-tungsten-gray`

Traska Chronograph import notes:
- The product page exposed one available Shopify product variant, SKU `CHR-GRY`.
- 1 row was imported.
- Product URL is included.
- Shopify product JSON was used for SKU, USD price, and availability.
- Product-page text and official spec/dimension images were used for case width, lug-to-lug distance, case height, movement type, caliber, and water resistance.
- Power reserve was left blank because the product page/spec images did not expose a direct power-reserve value.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://www.traskawatch.com/collections/commuter-collection`

Traska Commuter import notes:
- The Commuter collection exposed 12 product-card rows in Shopify collection JSON.
- The owner asked to work only with 38 mm watches and skip smaller models.
- The standard unavailable-watch rule was overridden for this collection; all 4 unavailable 38 mm Commuter models were imported.
- Product URLs are included.
- Shopify collection/product JSON was used for SKU, USD price, and availability.
- Product-page text and official spec/dimension images were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The no-date variants were imported from the primary product-card variant/SKU; the page notes date variants use Miyota 9019, but the imported `NDT` rows use Miyota 9039.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://www.traskawatch.com/collections/venturer`

Traska Venturer import notes:
- The Venturer collection exposed 4 product-card rows in Shopify collection JSON: Carbon Black, Steel Blue, Arctic White, and Bottle Green.
- All 4 Venturer GMT models were marked unavailable at import time, but were imported to complete the final Traska collection pass.
- Product URLs are included.
- Shopify collection/product JSON was used for SKU, USD price, and availability.
- Product-page text and official spec/dimension images were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Minus-8

Rows `1098-1102`: Minus-8 watches collection, 5 available variant rows.

Source collection:
`https://www.minus8watch.com/pages/watches-collection`

Minus-8 import notes:
- The watches collection page uses a Shopify/Replo/GemPages-style layout, so the collection page HTML did not expose a simple product-card URL list.
- Shopify `/collections/all/products.json` exposed 14 products, including straps, accessories, a gift card, and watch products.
- Non-watch products were skipped.
- The standard unavailable-watch rule was applied. Unavailable watches and unavailable color variants were skipped, including Anza, Diver 2.0 Model R, Layer 2.0, Diver 1T Solar Grey, Diver 2.0 Black, and Field 1S Desert.
- 5 available variant rows were imported: Diver 1T Solar Black, Diver 2.0 Grey, Diver GMT Black, Diver GMT Grey, and Field 1S Black.
- Product URLs are included.
- Shopify product JSON was used for SKU, USD price, variant availability, and source URLs.
- Product-page specification text was used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- `case_height_mm` is blank for Field 1S because the fetched product-page specification text did not expose a direct case-height value.
- Diver 1T Solar's 4-month full-charge reserve was normalized into `power_reserve_hours` as `2880` hours.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Baltic

Rows `1103-1105`: Baltic Heures du Monde collection, 3 rows imported by owner exception.

Rows `1106-1112`: Baltic Hermetique collection, 7 rows imported after color exclusions.

Rows `1113-1115`: Baltic Aquascaphe GMT collection, 3 available rows imported.

Rows `1116-1122`: Baltic Aquascaphe MK2 collection, 7 available size/color rows imported.

Rows `1123-1129`: Baltic MR collection, 7 available rows imported.

Rows `1130-1131`: Baltic Aquascaphe Classic collection, 2 available rows imported.

Rows `1132-1133`: Baltic Scalegraph collection, 2 available rows imported.

Rows `1134-1135`: Baltic Aquascaphe Titanium collection, 2 available rows imported.

Rows `1136-1138`: Baltic Aquascaphe Bronze collection, 3 available rows imported.

Rows `1139-1141`: Baltic Aquascaphe Dual-Crown collection, 3 available rows imported.

Rows `1142-1148`: Baltic HMS collection, 7 available rows imported.

Source collection:
`https://baltic-watches.com/en/collections/heures-du-monde`

Baltic Heures du Monde import notes:
- The collection exposed 3 product rows: Labradorite, Tiger Eye, and Sodalite.
- All 3 Heures du Monde Worldtimer products were marked unavailable at import time, but were imported after owner follow-up.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- The base pressed-strap price of `1300` EUR was used in `price`; bracelet variants were listed at `1360` EUR.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/hermetique`

Baltic Hermetique import notes:
- The collection exposed 11 product rows.
- The owner asked to skip pink, turquoise, orange, and yellow. The 4 Hermetique Summer colors were excluded.
- 7 available Tourer rows were imported: Beige, Green, Blue, Brown, Bronze Green, Bronze Brown, and Bronze Blue.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base rubber-strap pricing was used in `price`: `550` EUR for stainless steel Tourer models and `600` EUR for bronze Tourer models.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/aquascaphe-gmt`

Baltic Aquascaphe GMT import notes:
- The collection exposed 3 product rows: Grey, Green, and Orange.
- All 3 Aquascaphe GMT models were available at import time.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base rubber-strap pricing was used in `price`: `940` EUR. Bracelet variants were listed at `1005` EUR.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- `dial_color` was set to `Black` for all 3 rows because Baltic's specification block lists a glossy black dial; the product color names refer to GMT bezel accents.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/aquascaphe-mk2`

Baltic Aquascaphe MK2 import notes:
- The collection exposed 4 product rows: Blue, Warm Silver, Grey, and Green.
- The product pages expose meaningful 37 mm and 39.5 mm size variants, so available size variants were imported as separate rows.
- 7 rows were imported: Blue 39.5 mm, Blue 37 mm, Green 39.5 mm, Green 37 mm, Grey 39.5 mm, Grey 37 mm, and Warm Silver 37 mm.
- Warm Silver 39.5 mm variants were marked unavailable at import time and were skipped under the standard unavailable-watch rule.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base rubber-strap pricing was used in `price`: `630` EUR. Bracelet variants were listed at `695` EUR.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/mr`

Baltic MR import notes:
- The collection exposed 8 product rows: MR Classic Salmon, Blue, Silver, Gold PVD Black, and MR Roulette Blue, Salmon, Silver, Black.
- The owner asked to skip out-of-stock models. MR Roulette Black was marked unavailable and was skipped.
- 7 available rows were imported.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base leather-strap pricing was used in `price`: `545` EUR. Beads of rice bracelet variants were listed at `605` EUR where offered.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/aquascaphe`

Baltic Aquascaphe Classic import notes:
- The collection exposed 2 product rows: Aquascaphe Classic Blue Gilt and Aquascaphe Classic Black Gilt.
- Both products were available at import time and both were imported.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base rubber-strap pricing was used in `price`: `600` EUR. Bracelet variants were listed at `665` EUR.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/scalegraph`

Baltic Scalegraph import notes:
- The collection exposed 2 product rows: Scalegraph Classic Panda and Scalegraph Classic Reverse Panda.
- Both products were available at import time and both were imported.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base strap pricing was used in `price`: `1585` EUR. Bracelet variants were listed at `1695` EUR.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/aquascaphe-titanium`

Baltic Aquascaphe Titanium import notes:
- The collection exposed 2 product rows: Aquascaphe Titanium Blue and Aquascaphe Titanium Black.
- Both products were available at import time and both were imported.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Product-page pricing was `730` EUR for all fetched variants.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- Baltic listed thickness as `13,3mm`; this was normalized to `13.3` in `case_height_mm`.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/aquascaphe-bronze`

Baltic Aquascaphe Bronze import notes:
- The collection exposed 3 product rows: Aquascaphe Bronze Brown, Aquascaphe Bronze Blue Gilt, and Aquascaphe Bronze Black.
- All 3 products were available at import time and all 3 were imported.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Product-page pricing was `645` EUR for all fetched variants.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/aquascaphe-dual-crown`

Baltic Aquascaphe Dual-Crown import notes:
- The collection exposed 3 product rows: Aquascaphe Dual-Crown Blue, Aquascaphe Dual-Crown Black, and Aquascaphe Dual-Crown Black PVD Black.
- All 3 products were available at import time and all 3 were imported.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base strap pricing was used in `price`: `670` EUR. Steel bracelet variants were listed at `735` EUR where offered.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- Baltic listed thickness as `11,9mm`; this was normalized to `11.9` in `case_height_mm`.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Source collection:
`https://baltic-watches.com/en/collections/hms`

Baltic HMS import notes:
- The collection exposed 7 product rows: HMS 003 Salmon, HMS 003 Silver Blue, HMS 003 Blue Gilt, HMS 002 Silver, HMS 002 Blue Gilt, HMS 002 Black, and HMS 002 Gold PVD Black.
- All 7 products were available at import time and all 7 were imported.
- Product URLs are included.
- Baltic's Next.js/Shopify page data was used for product names, availability, EUR prices, and source URLs.
- Baltic did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Base strap pricing was used in `price`: `360` EUR for standard HMS 002/003 rows and `385` EUR for HMS 002 Gold PVD Black. Bracelet variants were listed at `445` EUR where offered.
- Product-page specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, power reserve, and water resistance.
- Baltic listed HMS 003 diameter as `36,5mm`; this was normalized to `36.5` in `case_width_mm`.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Nautage

Rows `1149-1168`: Nautage Diver category, 20 product rows imported including out-of-stock variations.

Source collection:
`https://nautage.com/product-category/diver/`

Nautage Diver import notes:
- The owner asked to include out-of-stock variations, so all 20 watch product rows exposed on the Diver category page were imported.
- Imported rows include Diver II Black/Black, Black/Black Green Strap, Black/Blue Indices, Black/Blue, Black/Blue Blue Strap, Black/Green, Black/Green Green Strap, Silver/Black, Black/Black Orange Strap, Silver/Black Orange Strap, Silver/Blue, Silver/Blue Orange Strap, Silver/Green, plus Diver Silver Orange Strap, Silver, Black, Black Red Strap, Black Inverted Lume, Black Inverted Lume White Strap, and Gold.
- Product URLs are included.
- WooCommerce category and product-page HTML was used for product names, prices, source URLs, stock status, and product-page specification text.
- Nautage did not expose SKU values in the fetched product-page data, so `sku` was left blank.
- Prices were imported in USD as shown on the fetched product pages: `599` for Diver II rows and `499` for Diver rows.
- Product-page short-description specification blocks were used for case width, lug-to-lug distance, case height, movement type, caliber, and water resistance.
- Nautage lists size as `41 x 49 x 12mm - 22mm lug width`; this was normalized to `case_width_mm: 41`, `lug_to_lug_mm: 49`, and `case_height_mm: 12`.
- Nautage did not list power reserve directly on the fetched product pages, so `power_reserve_hours` was left blank.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Alpina

Rows `1169-1191`: Alpina Alpiner collection, 23 product rows imported after the owner-requested size filter.

Source collection:
`https://alpinawatches.com/collections/alpiner-collection`

Alpina Alpiner import notes:
- The collection exposed 35 product rows.
- The owner asked to skip anything smaller than 38 mm, so 12 products were skipped: 5 Alpiner Extreme Solarmetre rows listed at `37.50 x 38.90 mm` and 7 Extreme Quartz rows listed at `34 x 35.2 mm`.
- 23 Alpiner rows were imported.
- Product URLs are included.
- Shopify product JSON was used for product names, SKUs, prices, availability, and source URLs.
- Official Alpina product-page specification accordions and descriptions were used for case width, case height, movement type, caliber, power reserve, water resistance, and dial color.
- Water resistance was normalized from ATM to meters.
- Alpina lists many cushion/tonneau case sizes as two dimensions, such as `39 x 40.5 mm`; `case_width_mm` uses the first dimension, while `lug_to_lug_mm` was left blank because Alpina did not label the second dimension as lug-to-lug.
- Prices are entered as the official numeric CHF prices exposed by Alpina product data.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `1192-1200`: Alpina Startimer collection, 9 available product rows imported.

Source collection:
`https://alpinawatches.com/collections/startimer-collection`

Alpina Startimer import notes:
- The collection exposed 9 product rows and all 9 were available in the fetched Shopify product data.
- Product URLs are included.
- Shopify product JSON was used for product names, SKUs, prices, availability, and source URLs.
- Official Alpina product-page specification accordions and descriptions were used for case width, case height, movement type, caliber, power reserve, water resistance, and dial color.
- Water resistance was normalized from ATM to meters.
- The newer 40 mm Startimer Pilot Automatic rows list a 68-hour AL-525 automatic movement, while the 41 mm Pilot Automatic rows list a 38-hour AL-525 automatic movement; the sheet preserves those variant-level differences.
- Quartz chronograph battery life was not converted into `power_reserve_hours`, so the quartz rows keep that field blank.
- Prices are entered as the official numeric CHF prices exposed by Alpina product data.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `1201-1208`: Alpina Seastrong collection, 8 available product rows imported.

Source collection:
`https://alpinawatches.com/collections/seastrong-collection`

Alpina Seastrong import notes:
- The collection exposed 8 product rows and all 8 were available in the fetched Shopify product data.
- Product URLs are included.
- Shopify product JSON was used for product names, SKUs, prices, availability, and source URLs.
- Official Alpina product-page specification accordions and descriptions were used for case width, case height, movement type, caliber, power reserve, water resistance, and dial color.
- Water resistance was normalized from `30 ATM` to `300` meters.
- Alpina lists the Seastrong Diver Extreme case as `39 x 40.50 mm`; `case_width_mm` uses the first dimension, while `lug_to_lug_mm` was left blank because Alpina did not label the second dimension as lug-to-lug.
- The two Seastrong Diver Extreme GMT rows were tagged with `GMT` and preserve their AL-560 movement and 50-hour power reserve.
- Prices are entered as the official numeric CHF prices exposed by Alpina product data.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `1209-1218`: Alpina Heritage collection, 10 available product rows imported.

Source collection:
`https://alpinawatches.com/collections/heritage-collection`

Alpina Heritage import notes:
- The collection exposed 10 product rows and all 10 were available in the fetched Shopify product data.
- Product URLs are included.
- Shopify product JSON was used for product names, SKUs, prices, availability, and source URLs.
- Official Alpina product-page specification accordions and descriptions were used for case width, case height, movement type, caliber, power reserve, water resistance, and dial color.
- Water resistance was normalized from ATM to meters.
- The Heritage Carrée models list rectangular case dimensions such as `32.50 x 39 mm`; `case_width_mm` uses the first dimension, while `lug_to_lug_mm` was left blank because Alpina did not label the second dimension as lug-to-lug.
- The Heritage Tropic-Proof Handwinding rows were imported with `movement_type: Hand-Wound` and their 42-hour AL-480 power reserve.
- The three Diver 300 Heritage rows were tagged as vintage-inspired divers and preserve their 300-meter water resistance.
- Prices are entered as the official numeric CHF prices exposed by Alpina product data.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

### Longines

Rows `1219-1228`: Longines HydroConquest GMT collection, 10 available product rows imported.

Source collection:
`https://www.longines.com/en-us/watches/conquest/hydroconquest-gmt`

Longines HydroConquest GMT import notes:
- The collection exposed 11 visible product rows.
- The 43 mm blue bracelet variant `L3.890.4.96.6` was marked unavailable/notify-me on the collection page and was skipped under the standing unavailable-watch rule.
- 10 available HydroConquest GMT rows were imported across 43 mm and 41 mm case sizes.
- Product URLs are included.
- Official Longines product pages and indexed product-page data were used for product names, SKUs, prices, availability, source URLs, case width, lug-to-lug, case height, movement type, caliber, power reserve, water resistance, and dial color.
- Water resistance was normalized from `30 bar` to `300` meters.
- Longines directly lists lug-to-lug and thickness, so both `lug_to_lug_mm` and `case_height_mm` were populated.
- The 43 mm rows use `lug_to_lug_mm: 52` and `case_height_mm: 12.9`; the 41 mm rows use `lug_to_lug_mm: 49.4` and `case_height_mm: 12.9`.
- Prices are entered as official numeric USD prices from the Longines US product pages.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

Rows `1229-1252`: Longines Conquest collection, 24 available rows imported after the owner-requested size filter.

Source collection:
`https://www.longines.com/en-us/watches/conquest/conquest?page=3`

Longines Conquest import notes:
- The Conquest collection exposed 54 visible product rows across 3 paginated pages.
- The owner asked to skip anything smaller than 38 mm, so all 29.5 mm, 30 mm, and 34 mm rows were excluded.
- The 43 mm black quartz variant `L3.760.4.56.6` was marked unavailable/notify-me and was skipped under the standing unavailable-watch rule.
- 24 rows were imported: 38 mm and 41 mm modern automatic Conquest variants plus available 41 mm and 43 mm quartz Conquest variants.
- Product URLs are included.
- Official Longines collection/product pages and indexed product-page data were used for product names, SKUs, prices, availability, source URLs, case width, lug-to-lug, case height, movement type, caliber, power reserve, water resistance, and dial color.
- Modern 38 mm automatic rows use `lug_to_lug_mm: 46.8`, `case_height_mm: 10.9`, `caliber: L888`, `power_reserve_hours: 72`, and `water_resistance_m: 100`.
- Modern 41 mm automatic rows use `lug_to_lug_mm: 49.1`, `case_height_mm: 10.9`, `caliber: L888`, `power_reserve_hours: 72`, and `water_resistance_m: 100`.
- Older 41 mm quartz rows use `lug_to_lug_mm: 51`, `case_height_mm: 11.8`, `caliber: L157`, and `water_resistance_m: 300`.
- Older 43 mm quartz rows use `lug_to_lug_mm: 53.5`, `case_height_mm: 11.5`, `caliber: L157`, and `water_resistance_m: 300`.
- Quartz battery life was not converted into `power_reserve_hours`, so the quartz rows keep that field blank.
- Prices are entered as official numeric USD prices from the Longines US collection/product pages.
- The import intentionally skipped editorial positives/negatives; `positive_1` through `negative_5` were left blank for this factual pass.

## Implementation Notes For Later

When moving from Sheet to site:
- Create a repeatable Sheet-to-JSON export script or manual export workflow.
- Validate row data before build so strict fields do not drift.
- Consider a content collection or plain JSON module depending on how many pages are generated.
- For comparison pages, add a canonical URL strategy before generating many pairwise routes.
- For the quiz, start with a scoring function that awards weighted points rather than using hard filters only.
