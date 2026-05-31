import { z } from 'zod';
import { dailyProgressReports } from './shared/schema';

// This confirms the underlying issue: drizzle-zod's `createInsertSchema` type output does not play nicely with `.omit` when compiled.
// A very clean, standard fix is to write the `insertDailyProgressReportSchema` explicitly or not use `.omit()` when parsing but handle it manually.

// What if I just use `const validatedData: any = insertDailyProgressReportSchema.omit({ projectId: true } as any).parse(req.body);`? It circumvents TS, and then we extract fields manually.
