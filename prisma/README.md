# Prisma Schema and Migration Updates

This directory contains the Prisma schema and migration files for the Movie Ticket Booking application.

## Recent Changes

We've updated the schema to ensure consistent time formats and data integrity across the application. This addresses issues with showtime bookings, especially for newly added movies.

### Simplified Showtime Management
The application now uses a hybrid approach for showtimes:

1. Fixed showtimes are defined in `app/constants/showtimes.ts`
2. The booking system can create showtimes on-the-fly when needed
3. A utility script (`prisma/ensure-showtimes.ts`) can populate basic showtimes for all movies

This approach resolves issues with missing showtimes for new movies/theaters and simplifies the booking flow.

### Schema Improvements

1. **Time Format Consistency**
   - All time values now use 12-hour format (e.g., "10:00 AM", "7:30 PM")
   - Migration script converts existing 24-hour format times to 12-hour format

2. **Date Format Standardization**
   - All date values have zeroed time components (00:00:00)
   - This prevents time zone issues during date comparisons

3. **Format Validation**
   - Format options are limited to: "standard", "premium", "imax", "vip"
   - Migration ensures all existing formats conform to these options

4. **Pricing Updates**
   - Updated price ranges to 150-220 INR
   - Seed file uses consistent pricing structure

## Running Migrations

To apply these schema updates to your database, run the following commands in order:

```bash
# Create a new migration from schema changes
npx prisma migrate dev --name update_showtime_validation

# Apply the migration to your development database
npx prisma migrate dev

# Generate the updated Prisma client
npx prisma generate
```

## Database Seeding

After applying migrations, you can seed the database with sample data:

```bash
npx prisma db seed
```

## Vercel Deployment

For deploying to Vercel, ensure your build command includes the necessary Prisma steps:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

## Troubleshooting

If you encounter issues with showtime bookings after migration:

1. Verify time formats are consistent by checking the database
2. Run `npx prisma studio` to examine data visually
3. Reset the database if needed: `npx prisma migrate reset`

For more detailed commands, see `commands.txt` in this directory.

### Missing Showtimes
If movies are showing "No showtimes available" in the UI:

1. Run the ensure-showtimes script:
```
npx ts-node -r tsconfig-paths/register --project tsconfig.json prisma/ensure-showtimes.ts
```

2. Check the database for any issues with showtimes:
```
npx prisma studio
```

The application will now create showtimes on booking if none exist, but running the script ensures a better user experience.

### Other Issues
If you encounter other issues, please refer to the troubleshooting section in the README. 