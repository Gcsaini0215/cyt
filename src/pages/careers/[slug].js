// /careers/<slug> — the careers page opened on one job, with that job's own title, description and
// share image (so a shared job link previews the job). A closed or unknown job goes back to /careers.
import CareersPage from "../careers";
import { apiUrl } from "../../utils/url";

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  try {
    const r = await fetch(`${apiUrl}/careers/jobs`);
    const d = await r.json();
    const jobs = Array.isArray(d?.data) ? d.data : [];
    if (!jobs.some((j) => j.slug === params.slug)) return { redirect: { destination: "/careers", permanent: false }, revalidate: 60 };
    return { props: { initialJobs: jobs, focusSlug: params.slug }, revalidate: 300 };
  } catch {
    return { redirect: { destination: "/careers", permanent: false }, revalidate: 60 };
  }
}

export default CareersPage;
