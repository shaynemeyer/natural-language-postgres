import fs from "fs";
import csv from "csv-parser";
import path from "path";
import "dotenv/config";
import { unicorns as unicornsTable } from "@/db/schema/unicorns";
import { db } from "@/db/drizzle";

// function parseDate(dateString: string): string {
//   const parts = dateString.split("/");
//   if (parts.length === 3) {
//     const day = parts[0].padStart(2, "0");
//     const month = parts[1].padStart(2, "0");
//     const year = parts[2];
//     return `${year}-${month}-${day}`;
//   }
//   console.warn(`Could not parse date: ${dateString}`);
//   throw Error();
// }

export async function seed() {
  const results: any[] = [];
  const csvFilePath = path.join(process.cwd(), "unicorns.csv");

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))

      .on("end", resolve)
      .on("error", reject);
  });

  for (const row of results) {
    const formattedDate = new Date(row["Date Joined"]);

    const unicorn: typeof unicornsTable.$inferInsert = {
      company: row["Company"],
      valuation: parseFloat(
        row["Valuation"].replace("$", "").replace(",", "")
      ).toFixed(2),
      date_joined: formattedDate,
      country: row["Country"],
      city: row["City"],
      industry: row["Industry"],
      select_investors: row["Select Investors"],
    };

    await db.insert(unicornsTable).values(unicorn);
  }

  console.log(`Seeded ${results.length} unicorns`);

  return {
    unicorns: results,
  };
}

seed().catch(console.error);
