# Database Migration Guide - Composite Unique Constraints

## Overview
This migration updates the User model to use composite unique constraints that include `userType`, allowing the same phone/email to exist across different user types while maintaining uniqueness within each type.

## Schema Changes

### Before (Individual Unique Constraints)
```prisma
model User {
  email    String @unique
  phone    String @unique
  qid      String? @unique
  userType Int @default(0)
  // ...
}
```

### After (Composite Unique Constraints)
```prisma
model User {
  email    String
  phone    String
  qid      String?
  userType Int @default(0)
  // ...
  
  @@unique([phone, userType])
  @@unique([email, userType])
  @@unique([qid, userType])
}
```

## Migration Steps

### 1. Generate Migration
```bash
cd moveo-core
npx prisma migrate dev --name add-composite-unique-constraints
```

### 2. If Migration Fails Due to Existing Data
If you have existing data that violates the new constraints, you'll need to clean it up first:

#### Option A: Clean Up Duplicates (Recommended)
```sql
-- Find duplicate phones within same userType
SELECT phone, userType, COUNT(*) 
FROM "user" 
GROUP BY phone, userType 
HAVING COUNT(*) > 1;

-- Find duplicate emails within same userType  
SELECT email, userType, COUNT(*) 
FROM "user" 
GROUP BY email, userType 
HAVING COUNT(*) > 1;

-- Delete duplicates (keep the first one)
DELETE FROM "user" 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY phone, userType ORDER BY id) as rn
    FROM "user"
  ) t WHERE rn > 1
);
```

#### Option B: Reset Database (Development Only)
```bash
npx prisma migrate reset
```

### 3. Regenerate Prisma Client
```bash
npx prisma generate
```

## What This Enables

### ✅ Allowed Scenarios
- **Same phone across user types**: `+97412345678` can exist for both userType 0 and userType 1
- **Same email across user types**: `john@example.com` can exist for both regular user and driver
- **Same QID across user types**: `1234567890123456` can exist for multiple roles

### ❌ Blocked Scenarios  
- **Duplicate within same user type**: Two drivers can't have same phone
- **Duplicate within same user type**: Two regular users can't have same email
- **Database-level enforcement**: No application-level checks needed

## Code Changes Made

### 1. Schema Updates
- Removed individual `@unique` constraints
- Added composite `@@unique([field, userType])` constraints

### 2. Controller Updates
- Removed manual uniqueness checks
- Added database constraint error handling
- Simplified create/update logic

### 3. Error Handling
- Catches Prisma P2002 errors (unique constraint violations)
- Provides specific error messages per field
- Maintains same API response format

## Testing

### Test Scenarios
1. **Create regular user** with phone `+97412345678`
2. **Create driver** with same phone `+97412345678` (should work)
3. **Try to create another driver** with same phone (should fail)
4. **Update driver** to use existing driver's phone (should fail)

### Test Commands
```bash
# Test the new constraints
npm run test:drivers

# Or use the HTTP test files
# moveo-core/tests/multiple-user-records.http
```

## Rollback Plan

If you need to rollback:

### 1. Revert Schema
```prisma
model User {
  email    String @unique
  phone    String @unique  
  qid      String? @unique
  userType Int @default(0)
  // ...
}
```

### 2. Create Rollback Migration
```bash
npx prisma migrate dev --name revert-to-individual-unique-constraints
```

### 3. Update Controllers
- Restore manual uniqueness checks
- Remove database constraint error handling




