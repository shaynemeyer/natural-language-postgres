import { numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const unicorns = pgTable("unicorns", {
  id: serial().primaryKey(),
  company: text("company"),
  valuation: numeric({ precision: 10, scale: 2 }),
  date_joined: timestamp("date_joined").defaultNow(),
  country: text("country"),
  city: text("city"),
  industry: text("industry"),
  select_investors: text("select_investors"),
});
