// In service layer
import { mapDBToBeneficiary, mapBeneficiaryToDB } from '../types/beneficiary';

// Reading from database
const { data } = await db.get(collections.BENEFICIARIES, id);
const beneficiary = mapDBToBeneficiary(data);

// Writing to database
const dbData = mapBeneficiaryToDB(beneficiaryData);
await db.create(collections.BENEFICIARIES, dbData);

// Using query helpers with mapping
const queries = [
  queryHelpers.equal('city', 'Istanbul', 'beneficiaries'), // Auto-maps to 'sehri'
  queryHelpers.orderDesc('created_at', 'beneficiaries')
];
```

## For Collections without Mapping (All Others)

```typescript
// Use English field names directly
const queries = [
  queryHelpers.equal('status', 'active'),
  queryHelpers.greaterThan('amount', 100),
  queryHelpers.orderDesc('created_at')
];

const { data } = await db.list(collections.DONATIONS, queries);
// Use data directly, no mapping needed