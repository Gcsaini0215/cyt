import React, { useEffect, useMemo, useState } from "react";
import {
  services,
  dailyLiftIssuesList,
  therapyoptionlist,
  diagnoseslist,
  relationshipIssuesList,
} from "../../../utils/static-lists";
import { updateServiceExpertiesUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";
import useTherapistStore from "../../../store/therapistStore";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Section, SaveBar, toList } from "./settings-ui";

const SERVICE_META = {
  "Individual Counselling": { Icon: PersonRoundedIcon, desc: "One-on-one sessions" },
  "Couple Counselling": { Icon: PeopleRoundedIcon, desc: "Relationships & couples" },
  "Teen Counselling": { Icon: ChildCareRoundedIcon, desc: "Youth & adolescents" },
  "Diagnosis": { Icon: PsychologyRoundedIcon, desc: "Clinical assessment" },
  "Workshops/Training": { Icon: GroupsRoundedIcon, desc: "Groups & workshops" },
};

const CATEGORIES = [
  { title: "Daily life", list: dailyLiftIssuesList },
  { title: "Therapy options", list: therapyoptionlist },
  { title: "Diagnoses", list: diagnoseslist },
  { title: "Relationships", list: relationshipIssuesList },
];
const ALL_EXPERTISE = [...new Set(CATEGORIES.flatMap((c) => c.list))];

const same = (a, b) => a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

export default function ServicesAndExperties({ onDirty }) {
  const { therapistInfo, setInfo } = useTherapistStore();
  const [base, setBase] = useState(null); // { services, expertise } as last saved
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [activeCat, setActiveCat] = useState(0);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loaded = !!therapistInfo?.user?.email;
  useEffect(() => {
    if (loaded && !base) {
      const s = toList(therapistInfo.services), e = toList(therapistInfo.experties);
      setBase({ services: s, expertise: e });
      setSelectedServices(s);
      setSelectedExpertise(e);
    }
  }, [loaded, base, therapistInfo.services, therapistInfo.experties]);

  const dirty = !!base && (!same(base.services, selectedServices) || !same(base.expertise, selectedExpertise));
  useEffect(() => { onDirty && onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => { if (dirty) setSuccess(""); }, [dirty]);

  const toggle = (setter) => (item) => {
    setError("");
    setter((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };
  const toggleService = toggle(setSelectedServices);
  const toggleExpertise = toggle(setSelectedExpertise);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => (q ? ALL_EXPERTISE.filter((i) => i.toLowerCase().includes(q)) : CATEGORIES[activeCat].list),
    [q, activeCat]
  );

  const discard = () => {
    if (!base) return;
    setSelectedServices(base.services);
    setSelectedExpertise(base.expertise);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!selectedServices.length) { setError("Pick at least one service"); return; }
    if (!selectedExpertise.length) { setError("Pick at least one area of expertise"); return; }
    const reqData = { services: selectedServices.join(", "), experties: selectedExpertise.join(", ") };
    setSaving(true);
    try {
      const response = await postData(updateServiceExpertiesUrl, reqData);
      if (response.status) {
        setInfo("services", reqData.services);
        setInfo("experties", reqData.experties);
        setBase({ services: [...selectedServices], expertise: [...selectedExpertise] });
        setSuccess(response.message || "Offerings saved");
        setTimeout(() => setSuccess(""), 3500);
      } else {
        setError(response.message || "Something went wrong — please try again");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't save — check your connection and try again");
    }
    setSaving(false);
  };

  return (
    <div>
      <Section title="Services you offer" sub="Pick everything you provide — clients filter by these.">
        <div className="stg-cards" role="group" aria-label="Services">
          {services.map((service) => {
            const on = selectedServices.includes(service);
            const { Icon, desc } = SERVICE_META[service] || { Icon: CheckRoundedIcon, desc: "" };
            return (
              <button type="button" key={service} className={`stg-card${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggleService(service)}>
                <span className="stg-card-ic"><Icon /></span>
                <span><b>{service}</b>{desc && <small>{desc}</small>}</span>
                <span className="stg-card-tick" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title="Areas of expertise"
        sub="Shown as tags on your profile — they decide which concern pages list you."
        aside={selectedExpertise.length > 0 && (
          <button type="button" className="stg-link" onClick={() => { setError(""); setSelectedExpertise([]); }}>Clear all</button>
        )}
      >
        <div className="stg-exp-tools">
          <div className="stg-search stg-field">
            <SearchRoundedIcon />
            <input type="search" placeholder="Search e.g. anxiety, OCD, CBT" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search expertise" />
          </div>
        </div>

        {!q && (
          <div className="stg-cats" role="tablist" aria-label="Expertise categories">
            {CATEGORIES.map((c, i) => {
              const n = c.list.filter((x) => selectedExpertise.includes(x)).length;
              return (
                <button type="button" role="tab" aria-selected={activeCat === i} key={c.title}
                  className={`stg-cat${activeCat === i ? " active" : ""}`} onClick={() => setActiveCat(i)}>
                  {c.title}{n > 0 && <i>{n}</i>}
                </button>
              );
            })}
          </div>
        )}

        <div className="stg-chips">
          {visible.length ? visible.map((item) => {
            const on = selectedExpertise.includes(item);
            return (
              <button type="button" key={item} className={`stg-chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => toggleExpertise(item)}>
                {item}
              </button>
            );
          }) : <div className="stg-empty">No match for “{query}”.</div>}
        </div>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #eef2f0" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
            Selected · {selectedExpertise.length}
          </div>
          {selectedExpertise.length ? (
            <div className="stg-picked">
              {selectedExpertise.map((e) => (
                <span key={e}>{e}<button type="button" aria-label={`Remove ${e}`} onClick={() => toggleExpertise(e)}>×</button></span>
              ))}
            </div>
          ) : <div className="stg-empty">Nothing selected yet.</div>}
        </div>
      </Section>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSubmit} onDiscard={discard} error={error} success={success} label="Save offerings" />
    </div>
  );
}
