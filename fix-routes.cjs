const fs = require('fs');

let content = fs.readFileSync('server/routes.ts', 'utf8');

// Fix 1: DPR
content = content.replace(
  "const validatedData = insertDailyProgressReportSchema.omit({ projectId: true } as any).parse(req.body);",
  "const validatedData: any = insertDailyProgressReportSchema.omit({ projectId: true } as any).parse(req.body);"
);

// Fix 2: Referral
content = content.replace(
  "const validatedData = insertReferralSchema.pick({ referredEmail: true } as any).parse(req.body);",
  "const validatedData: any = insertReferralSchema.pick({ referredEmail: true } as any).parse(req.body);"
);

fs.writeFileSync('server/routes.ts', content);
