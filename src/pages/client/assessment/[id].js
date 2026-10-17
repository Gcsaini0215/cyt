import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ClientShell from "../../../components/client/client-shell";
import AssessmentForm from "../../../components/self-assessment/assessment-form";
import { TEST_BY_KEY } from "../../../components/self-assessment/tests";
import { fetchById, postData } from "../../../utils/actions";
import { apiUrl } from "../../../utils/url";

/* A clinical assessment booked with a session: answered here, scored on the server, sent to the
   psychologist. The client sees the report after the psychologist has gone through it with them. */

export default function ClientAssessment() {
  const router = useRouter();
  const { id } = router.query;
  const [req, setReq] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchById(`${apiUrl}/assessment-requests/${id}/take`)
      .then((r) => (r?.data ? setReq(r.data) : setErr("This assessment link isn't valid.")))
      .catch((e) => setErr(e?.response?.data?.message || "Couldn't load the assessment — please refresh."));
  }, [id]);

  const test = req && TEST_BY_KEY[req.tool];
  const submit = async (answers) => {
    try {
      const r = await postData(`${apiUrl}/assessment-requests/${id}/submit`, { answers });
      // just the assessment: the automatic report is ready at once
      if (r?.status && r?.data?.released) { router.push(`/assessment-report/${id}`); }
      return !!r?.status;
    } catch (e) { return false; }
  };

  return (
    <ClientShell title={test ? test.full : "Assessment"}>
      <div className="cas">
        <style dangerouslySetInnerHTML={{ __html: CAS_CSS }} />
        {err ? (
          <div className="cas-box"><b>{err}</b><Link href="/client/check-ins">Go to My check-ins</Link></div>
        ) : !req ? <div className="cas-skel" /> : !test ? (
          <div className="cas-box"><b>This assessment is no longer available.</b><Link href="/client/check-ins">Go to My check-ins</Link></div>
        ) : req.status !== "sent" ? (
          <div className="cas-box">
            <b>{req.status === "released" ? "Your report is ready." : "You've already submitted this assessment."}</b>
            <span>{req.status === "released" ? "" : `${req.therapist} will go through the result with you in your session.`}</span>
            <Link href={req.status === "released" ? `/assessment-report/${req._id}` : "/client/check-ins"}>{req.status === "released" ? "View report" : "Go to My check-ins"}</Link>
          </div>
        ) : (
          <AssessmentForm test={test} onBack={() => router.push("/client/check-ins")} clinical={{ therapist: req.therapist, selfOnly: !!req.selfOnly, onSubmit: submit }} />
        )}
      </div>
    </ClientShell>
  );
}

const CAS_CSS = `
.cas .saf { background: transparent; padding: 0 0 24px; }
.cas .saf-in { padding: 0; }
.cas-skel { height: 320px; border-radius: 18px; background: #e9eeeb; max-width: 760px; }
.cas-box { max-width: 560px; background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 6px; }
.cas-box b { font-size: 16px; color: #0f172a; } .cas-box span { font-size: 13.5px; color: #475569; }
.cas-box a { margin-top: 6px; font-weight: 800; color: #166534 !important; }
`;
