import React, { useEffect, useRef, useState } from "react";
import { fetchById, putData } from "../../utils/actions";
import { apiUrl } from "../../utils/url";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

/* "Prepare for this session": the client jots down what they want to talk about. Saved with the
   account as they type (/my-session-notes) and private — the therapist never sees it. */

const PROMPTS = ["What's been on my mind:", "Something that went well:", "What I'd like help with:", "A question for my therapist:"];

export default function SessionNote({ bookingId }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(null); // null = not loaded yet
  const [state, setState] = useState(""); // "", "saving", "saved", "error"
  const timer = useRef(null);
  const last = useRef("");

  useEffect(() => {
    let alive = true;
    fetchById(`${apiUrl}/my-session-notes/${bookingId}`)
      .then((r) => { if (!alive) return; const t = r?.data?.text || ""; last.current = t; setText(t); if (t) setOpen(true); })
      .catch(() => { if (alive) setText(""); });
    return () => { alive = false; clearTimeout(timer.current); };
  }, [bookingId]);

  const save = (t) => {
    if (t === last.current) return;
    setState("saving");
    putData(`${apiUrl}/my-session-notes/${bookingId}`, { text: t })
      .then(() => { last.current = t; setState("saved"); })
      .catch(() => setState("error"));
  };
  const change = (t) => {
    setText(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(t), 900);
  };
  const addPrompt = (p) => change(`${text ? `${text.replace(/\s+$/, "")}\n` : ""}${p} `);

  if (text === null) return null;
  return (
    <div className={`csn${open ? " open" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: CSN_CSS }} />
      <button type="button" className="csn-tog" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <EditNoteRoundedIcon />
        <span>{text ? "My notes for this session" : "Prepare for this session"}</span>
        <ExpandMoreRoundedIcon className="chev" />
      </button>
      {open && (
        <div className="csn-body">
          <div className="csn-prompts">
            {PROMPTS.map((p) => <button key={p} type="button" onClick={() => addPrompt(p)}>{p.replace(/:$/, "")}</button>)}
          </div>
          <textarea value={text} onChange={(e) => change(e.target.value)} onBlur={() => { clearTimeout(timer.current); save(text); }}
            rows={4} maxLength={2000} placeholder="What would you like to talk about? Jot it down so nothing slips your mind." aria-label="My notes for this session" />
          <div className="csn-foot">
            <span><LockRoundedIcon /> Only you can see this</span>
            <em className={state}>{state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Couldn't save — check your connection" : ""}</em>
          </div>
        </div>
      )}
    </div>
  );
}

const CSN_CSS = `
.csn { border: 1px dashed #cfe3d6; border-radius: 12px; background: #fbfdfb; }
.csn.open { border-style: solid; }
.csn-tog { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 12px; border: 0; background: none; font: inherit; font-size: 13.5px; font-weight: 800; color: #14532d; cursor: pointer; text-align: left; }
.csn-tog > svg { font-size: 20px; color: #16a34a; } .csn-tog span { flex: 1; }
.csn-tog .chev { color: #64748b; transition: transform .2s; } .csn.open .csn-tog .chev { transform: rotate(180deg); }
.csn-body { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.csn-prompts { display: flex; flex-wrap: wrap; gap: 6px; }
.csn-prompts button { border: 1px solid #d6e9dc; background: #fff; border-radius: 999px; padding: 4px 10px; font: inherit; font-size: 12px; font-weight: 700; color: #166534; cursor: pointer; }
.csn textarea { width: 100%; border: 1px solid #d6e0da; border-radius: 10px; padding: 10px 12px; font: inherit; font-size: 14px; resize: vertical; min-height: 90px; background: #fff; box-sizing: border-box; }
.csn textarea:focus { outline: none; border-color: #166534; box-shadow: 0 0 0 3px rgba(22,101,52,.12); }
.csn-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: #64748b; }
.csn-foot span { display: inline-flex; align-items: center; gap: 4px; } .csn-foot svg { font-size: 14px; }
.csn-foot em { font-style: normal; font-weight: 700; color: #16a34a; } .csn-foot em.error { color: #dc2626; } .csn-foot em.saving { color: #64748b; }
`;
