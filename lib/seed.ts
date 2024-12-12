import fs from "fs";
import csv from "csv-parser";
import path from "path";
import "dotenv/config";

function parseDate(dateString: string): string {
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  console.warn(`Could not parse date: ${dateString}`);
  throw Error();
}

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
    const formattedDate = parseDate(row["Date Joined"]);

    await sql`
      INSERT INTO unicorns (company, valuation, date_joined, country, city, industry, select_investors)
      VALUES (
        ${row.Company},
        ${parseFloat(row["Valuation ($B)"].replace("$", "").replace(",", ""))},
        ${formattedDate},
        ${row.Country},
        ${row.City},
        ${row.Industry},
        ${row["Select Investors"]}
      )
      ON CONFLICT (company) DO NOTHING;
    `;
  }

  console.log(`Seeded ${results.length} unicorns`);

  return {
    createTable,
    unicorns: results,
  };
}

seed().catch(console.error);
