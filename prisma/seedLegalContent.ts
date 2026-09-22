// One-off updater for the two legal blocks the client supplied from their
// lawyer: Terms & Conditions and the Cancellation Policy.
//
// Unlike seedMasterData.ts, this one DOES overwrite - that is the point. It
// replaces the placeholder copy that shipped with the first release with the
// real legal text. Run it once; after that, edits belong in the admin panel
// (Content -> Itinerary PDF Content), and re-running would discard them.
//
// Corrections made to the supplied text, all transcription damage rather than
// wording changes - worth a read-through by whoever supplied it:
//   * stray list numbers left mid-sentence ("33-", "46-") removed
//   * a stray "SNAPINGO" line that was a page header in the source removed
//   * the Rohtang Pass paragraph appeared twice; the duplicate was dropped
//   * "Type puncture" -> "tyre puncture"
//   * "AC in the vehicle will not work on any hill stations" was a duplicate
//     of "Vehicle AC will not work at hill stations"; one kept
//   * run-together words from the source ("Lessthan15daysofcheckin") spaced out
//   * sentence-level punctuation added where lines ran together
//
// Run with: npm run db:seed:legal
import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { cancellationPolicyBody, termsBody } from "./legalContent";

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }),
});

async function main() {
  const blocks = [
    { key: "PDF_TERMS" as const, title: "Terms & Conditions", body: termsBody },
    { key: "PDF_CANCELLATION_POLICY" as const, title: "Cancellation Policy", body: cancellationPolicyBody },
  ];

  for (const block of blocks) {
    await db.contentBlock.upsert({
      where: { key: block.key },
      update: { title: block.title, body: block.body },
      create: block,
    });
    const lines = block.body.split("\n").length;
    console.log(`${block.key}: ${lines} clauses written`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
