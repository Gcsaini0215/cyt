// The old per-trainee page (it showed sample tasks and attendance) — the trainee portal now lives at /trainee
// and needs the trainee sign-in, so old links go there.
export async function getServerSideProps() {
  return { redirect: { destination: "/trainee", permanent: false } };
}

export default function OldTraineePage() {
  return null;
}
