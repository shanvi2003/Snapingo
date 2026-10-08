// A quotation stores every traveller age in one list (`childAges`): the
// children's ages first, one per child, then the infants'. Splitting by the
// children count gives each group back.
export function splitTravellerAges(ages: string[], children: number): { childAges: string[]; infantAges: string[] } {
  const count = Math.max(0, children);
  return { childAges: ages.slice(0, count), infantAges: ages.slice(count) };
}

const yearsLabel = (n: number) => (n === 0 ? "Below 1 year" : n === 1 ? "1 year" : `${n} years`);
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => yearsLabel(from + i));

export const INFANT_AGES = range(0, 5);
export const CHILD_AGES = range(6, 12);
