// Shared client + server filter predicate for the therapist directory.
// The backend only filters by profile_type / year_of_exp / language_spoken /
// search — state and services are applied entirely here. Used both in
// getServerSideProps (so the SSR'd HTML matches what a crawler should see
// for a given filter combination) and client-side when the user changes a
// filter without a page reload.
import { split, sessionModes } from "./therapist-directory";

export function filterTherapists(allData, filter) {
  let filtered = allData;

  if (filter.search) {
    const q = filter.search.toLowerCase();
    filtered = filtered.filter(i =>
      (i.user?.name || "").toLowerCase().includes(q) ||
      (i.services || "").toLowerCase().includes(q) ||
      (i.language_spoken || "").toLowerCase().includes(q) ||
      (i.state || "").toLowerCase().includes(q) ||
      (i.office_address || "").toLowerCase().includes(q) ||
      (i.experties || "").toLowerCase().includes(q)
    );
  }
  if (filter.profile_type) filtered = filtered.filter(i => i.profile_type === filter.profile_type);
  if (filter.services) filtered = filtered.filter(i => i.services?.includes(filter.services));
  if (filter.year_of_exp) filtered = filtered.filter(i => (i.year_of_exp || "").trim() === filter.year_of_exp);
  if (filter.language_spoken) filtered = filtered.filter(i => i.language_spoken?.includes(filter.language_spoken));
  if (filter.state) filtered = filtered.filter(i => (i.state || "").toLowerCase() === filter.state.toLowerCase());
  if (filter.concern) filtered = filtered.filter(i => split(i.experties).includes(filter.concern));
  if (filter.mode === "online") filtered = filtered.filter(i => sessionModes(i).online);
  if (filter.mode === "in-person") filtered = filtered.filter(i => sessionModes(i).inPerson);
  if (filter.gender) filtered = filtered.filter(i => (i.user?.gender || "").toLowerCase() === filter.gender.toLowerCase());

  return filtered;
}
