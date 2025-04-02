# Prisma Schema and Migration Updates

This directory contains the Prisma schema and migration files for the Movie Ticket Booking application.

## Recent Changes

We've updated the schema to ensure consistent time formats and data integrity across the application. This addresses issues with showtime bookings, especially for newly added movies.

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