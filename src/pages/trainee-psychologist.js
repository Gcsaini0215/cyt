import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getDecodedToken, removeToken } from "../utils/jwt";

// ── Mock data (replace with API when backend ready) ───────────────────────────

const MOCK_TASKS = [
  { id:1, title:"Submit Weekly Reflection Log",    desc:"Write a 300-word reflection on your learnings this week.",           due:"2025-06-07", status:"Pending",     priority:"High" },
  { id:2, title:"Case Study Report — Session 3",   desc:"Document the case formulation and intervention plan for Session 3.", due:"2025-06-10", status:"In Progress", priority:"High" },
  { id:3, title:"Complete Supervision Log",        desc:"Fill in the supervision log template for the current week.",         due:"2025-06-05", status:"Completed",   priority:"Medium" },
  { id:4, title:"Read: CBT Techniques Overview",   desc:"Review the assigned reading and submit a 1-page summary.",          due:"2025-06-12", status:"Pending",     priority:"Low" },
  { id:5, title:"Observe Group Therapy Session",   desc:"Shadow Dr. Anjali during the Thursday group therapy session.",      due:"2025-06-08", status:"Completed",   priority:"Medium" },
  { id:6, title:"Intake Form Documentation",       desc:"Complete documentation for the new client intake from Session 5.",  due:"2025-06-14", status:"Pending",     priority:"High" },
];

const ATTENDANCE = {
  1:"present",2:"present",3:"leave",  4:"present",5:"present",
  6:"absent", 7:"present",8:"present",9:"present",10:"present",
  11:"present",12:"absent",13:"present",14:"present",15:"present",
  16:"present",17:"present",18:"present",19:"leave",20:"present",
  21:"present",22:"present",23:"present",
};

const WEEK_HOURS = [
  {day:"Mon",h:4},{day:"Tue",h:5},{day:"Wed",h:3},
  {day:"Thu",h:6},{day:"Fri",h:4.5},{day:"Sat",h:2},{day:"Sun",h:0},
];

const RESOURCES = [
  {name:"Case Report Template",        type:"DOCX", icon:"feather-file-text",    size:"45 KB",  color:"#0ea5e9"},
  {name:"Supervision Log Template",    type:"DOCX", icon:"feather-clipboard",    size:"32 KB",  color:"#8b5cf6"},
  {name:"Weekly Reflection Form",      type:"PDF",  icon:"feather-edit",         size:"28 KB",  color:"#f59e0b"},
  {name:"Internship Guidelines 2025",  type:"PDF",  icon:"feather-book-open",    size:"1.2 MB", color:"#228756"},
  {name:"Ethics & Confidentiality",    type:"PDF",  icon:"feather-shield",       size:"210 KB", color:"#dc2626"},
  {name:"Emergency Referral Protocol", type:"PDF",  icon:"feather-alert-circle", size:"95 KB",  color:"#ef4444"},
];

const ANNOUNCEMENTS = [
  {id:1, title:"Supervision Session Rescheduled", body:"This week's group supervision is moved to Friday 4 PM.",      date:"Jun 4",  tag:"Schedule"},
  {id:2, title:"New Resource Added",              body:"CBT worksheet pack has been added to your resources section.", date:"Jun 2",  tag:"Resource"},
  {id:3, title:"Monthly Review on Jun 30",        body:"Your 30-day check-in review is scheduled for June 30.",       date:"May 30", tag:"Important"},
];

const NAV = [
  {id:"overview",     label:"Overview",     icon:"feather-home"},
  {id:"tasks",        label:"My Tasks",     icon:"feather-check-square"},
  {id:"attendance",   label:"Attendance",   icon:"feather-calendar"},
  {id:"progress",     label:"Progress",     icon:"feather-trending-up"},
  {id:"resources",    label:"Resources",    icon:"feather-folder"},
  {id:"profile",      label:"My Profile",   icon:"feather-user"},
  {id:"certificates", label:"Certificates", icon:"feather-award"},
];

const STATUS_STYLE = {
  "Active":      {bg:"#f0fdf4", color:"#166534", border:"#bbf7d0"},
  "Pending":     {bg:"#fffbeb", color:"#92400e", border:"#fde68a"},
  "Completed":   {bg:"#eff6ff", color:"#1e40af", border:"#bfdbfe"},
  "In Progress": {bg:"#f0f9ff", color:"#0369a1", border:"#bae6fd"},
  "Overdue":     {bg:"#fef2f2", color:"#991b1b", border:"#fecaca"},
};

const PRIORITY_COLOR = {High:"#dc2626", Medium:"#d97706", Low:"#228756"};

// ── Shared UI atoms ───────────────────────────────────────────────────────────

function Chip({label}) {
  const s = STATUS_STYLE[label] || STATUS_STYLE["Pending"];
  return (
    <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
      {label}
    </span>
  );
}

function Card({style={}, children}) {
  return <div style={{background:"#fff",borderRadius:16,border:"1.5px solid #f1f5f9",padding:"20px 22px",...style}}>{children}</div>;
}

function SecLabel({children}) {
  return <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.8px",margin:"0 0 14px"}}>{children}</p>;
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({user, tasks, isMobile, setTab}) {
  const done     = tasks.filter(t => t.status === "Completed").length;
  const weekH    = WEEK_HOURS.reduce((s,d) => s + d.h, 0);
  const present  = Object.values(ATTENDANCE).filter(v => v === "present").length;
  const attTotal = Object.keys(ATTENDANCE).length;
  const attPct   = Math.round((present / attTotal) * 100);
  const daysTotal = 90, daysDone = 23;
  const barPct    = Math.round((daysDone / daysTotal) * 100);
  const activeTasks = tasks.filter(t => t.status !== "Completed").slice(0, 3);

  const stats = [
    {label:"Tasks Completed", value:`${done}/${tasks.length}`, icon:"feather-check-square", color:"#228756", bg:"#f0fdf4"},
    {label:"Hours This Week",  value:`${weekH}h`,              icon:"feather-clock",         color:"#0ea5e9", bg:"#f0f9ff"},
    {label:"Attendance",       value:`${attPct}%`,             icon:"feather-calendar",      color:"#8b5cf6", bg:"#f5f3ff"},
    {label:"Days Remaining",   value:`${daysTotal-daysDone}`,  icon:"feather-trending-up",   color:"#f59e0b", bg:"#fffbeb"},
  ];

  const tagStyle = t => ({
    fontSize:10, fontWeight:700, borderRadius:20, padding:"2px 8px", border:"1px solid",
    background: t==="Important"?"#fef2f2":t==="Schedule"?"#f0f9ff":"#f5f3ff",
    color:       t==="Important"?"#991b1b":t==="Schedule"?"#0369a1":"#6d28d9",
    borderColor: t==="Important"?"#fecaca":t==="Schedule"?"#bae6fd":"#ddd6fe",
  });

  return (
    <div>
      {/* Welcome banner */}
      <div style={{background:"linear-gradient(135deg,#1b5e20 0%,#228756 60%,#2ecc71 100%)",borderRadius:20,padding:isMobile?"22px 20px":"28px 32px",marginBottom:24,position:"relative",overflow:"hidden",color:"#fff"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.06)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-20,left:80,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.04)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <span style={{background:"rgba(255,255,255,0.18)",color:"#fff",fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",padding:"4px 12px",borderRadius:20,display:"inline-block",marginBottom:12}}>
            Trainee Psychologist
          </span>
          <h2 style={{fontSize:isMobile?22:28,fontWeight:900,margin:"0 0 6px",lineHeight:1.2}}>
            Welcome, {(user?.name||"Trainee").split(" ")[0]}
          </h2>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:13,margin:"0 0 20px"}}>
            {user?.email} &nbsp;·&nbsp; <span style={{fontWeight:700,color:"#a7f3d0"}}>Active Intern</span>
          </p>
          <div style={{maxWidth:320}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>Internship Progress</span>
              <span style={{fontSize:12,fontWeight:800}}>{daysDone}/{daysTotal} days ({barPct}%)</span>
            </div>
            <div style={{height:7,background:"rgba(255,255,255,0.2)",borderRadius:10,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${barPct}%`,background:"#a7f3d0",borderRadius:10}}/>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {stats.map((s,i) => (
          <Card key={i} style={{padding:"18px 20px"}}>
            <div style={{width:38,height:38,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
              <i className={s.icon} style={{fontSize:17,color:s.color}}></i>
            </div>
            <p style={{fontSize:isMobile?22:26,fontWeight:900,color:"#1e293b",margin:"0 0 3px"}}>{s.value}</p>
            <p style={{fontSize:11,color:"#94a3b8",margin:0,fontWeight:600}}>{s.label}</p>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 340px",gap:20}}>
        {/* Active tasks */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <SecLabel>Active Tasks</SecLabel>
            <button onClick={() => setTab("tasks")} style={{background:"none",border:"none",color:"#228756",fontSize:12,fontWeight:700,cursor:"pointer",padding:0,marginTop:-14}}>
              View All →
            </button>
          </div>
          {activeTasks.length === 0
            ? <p style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:"20px 0"}}>All tasks completed!</p>
            : activeTasks.map(t => (
                <div key={t.id} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 0",borderBottom:"1px solid #f8fafc"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:PRIORITY_COLOR[t.priority]||"#94a3b8",flexShrink:0,marginTop:4}}></span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:700,color:"#1e293b",margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <Chip label={t.status}/>
                      <span style={{fontSize:11,color:"#94a3b8"}}>Due {t.due}</span>
                    </div>
                  </div>
                </div>
              ))
          }
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Mentor */}
          <Card style={{padding:"18px 20px"}}>
            <SecLabel>Your Mentor</SecLabel>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#1b5e20,#228756)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"#fff",fontWeight:900,fontSize:18}}>A</span>
              </div>
              <div>
                <p style={{margin:"0 0 2px",fontWeight:700,color:"#1e293b",fontSize:14}}>Dr. Anjali Mehta</p>
                <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>Clinical Supervisor</p>
              </div>
            </div>
            <a href="mailto:supervision@chooseyourtherapist.in" style={{display:"flex",alignItems:"center",gap:8,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"9px 12px",textDecoration:"none",color:"#166534",fontSize:12,fontWeight:700}}>
              <i className="feather-mail" style={{fontSize:14}}></i> Contact Mentor
            </a>
          </Card>

          {/* Announcements */}
          <Card style={{padding:"18px 20px"}}>
            <SecLabel>Announcements</SecLabel>
            {ANNOUNCEMENTS.map((a,i) => (
              <div key={a.id} style={{marginBottom:i<ANNOUNCEMENTS.length-1?14:0,paddingBottom:i<ANNOUNCEMENTS.length-1?14:0,borderBottom:i<ANNOUNCEMENTS.length-1?"1px solid #f8fafc":"none"}}>
                <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:4}}>
                  <span style={tagStyle(a.tag)}>{a.tag}</span>
                  <span style={{fontSize:10,color:"#94a3b8"}}>{a.date}</span>
                </div>
                <p style={{margin:"0 0 2px",fontSize:13,fontWeight:700,color:"#1e293b"}}>{a.title}</p>
                <p style={{margin:0,fontSize:12,color:"#64748b",lineHeight:1.5}}>{a.body}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Tasks ────────────────────────────────────────────────────────────────

function TasksTab({tasks, setTasks, isMobile}) {
  const [filter, setFilter] = useState("All");
  const counts = {All:tasks.length, Pending:tasks.filter(t=>t.status==="Pending").length, "In Progress":tasks.filter(t=>t.status==="In Progress").length, Completed:tasks.filter(t=>t.status==="Completed").length};
  const visible = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  const markDone = id => setTasks(prev => prev.map(t => t.id === id ? {...t, status:"Completed"} : t));

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["All","Pending","In Progress","Completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"7px 16px",borderRadius:20,border:`1.5px solid ${filter===f?"#228756":"#e2e8f0"}`,
            background:filter===f?"#228756":"#fff",color:filter===f?"#fff":"#475569",
            fontSize:12,fontWeight:700,cursor:"pointer",
          }}>{f} ({counts[f]})</button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {visible.length === 0 && (
          <Card style={{textAlign:"center",padding:"40px"}}>
            <i className="feather-check-circle" style={{fontSize:36,color:"#228756",display:"block",marginBottom:12}}></i>
            <p style={{color:"#64748b",fontSize:14,margin:0}}>No tasks in this category.</p>
          </Card>
        )}
        {visible.map(t => (
          <Card key={t.id} style={{padding:"18px 20px"}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <button onClick={() => t.status !== "Completed" && markDone(t.id)} style={{
                width:20,height:20,borderRadius:6,flexShrink:0,marginTop:2,
                border:`2px solid ${t.status==="Completed"?"#228756":"#d1d5db"}`,
                background:t.status==="Completed"?"#228756":"#fff",
                cursor:t.status==="Completed"?"default":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                {t.status === "Completed" && <i className="feather-check" style={{fontSize:11,color:"#fff"}}></i>}
              </button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:5}}>
                  <span style={{fontSize:14,fontWeight:700,color:t.status==="Completed"?"#94a3b8":"#1e293b",textDecoration:t.status==="Completed"?"line-through":"none"}}>{t.title}</span>
                  <Chip label={t.status}/>
                </div>
                <p style={{margin:"0 0 8px",fontSize:12,color:"#64748b",lineHeight:1.6}}>{t.desc}</p>
                <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#94a3b8"}}>
                    <i className="feather-calendar" style={{fontSize:12}}></i> Due {t.due}
                  </span>
                  <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:PRIORITY_COLOR[t.priority]}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:PRIORITY_COLOR[t.priority]}}></span>
                    {t.priority} Priority
                  </span>
                </div>
              </div>
              {t.status !== "Completed" && (
                <button onClick={() => markDone(t.id)} style={{
                  padding:"6px 14px",borderRadius:8,background:"#f0fdf4",border:"1px solid #bbf7d0",
                  color:"#166534",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
                }}>Mark Done</button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Attendance ───────────────────────────────────────────────────────────

function AttendanceTab({isMobile}) {
  const present  = Object.values(ATTENDANCE).filter(v => v === "present").length;
  const absent   = Object.values(ATTENDANCE).filter(v => v === "absent").length;
  const leave    = Object.values(ATTENDANCE).filter(v => v === "leave").length;
  const total    = Object.keys(ATTENDANCE).length;
  const pct      = Math.round((present / total) * 100);
  const DOT_COLOR = {present:"#228756", absent:"#dc2626", leave:"#d97706"};

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[
          {label:"Present",     value:present, color:"#228756", border:"#bbf7d0"},
          {label:"Absent",      value:absent,  color:"#dc2626", border:"#fecaca"},
          {label:"Leave",       value:leave,   color:"#d97706", border:"#fde68a"},
          {label:"Attendance %",value:`${pct}%`,color:"#0ea5e9",border:"#bae6fd"},
        ].map((s,i) => (
          <Card key={i} style={{padding:"16px 18px",borderColor:s.border}}>
            <p style={{fontSize:26,fontWeight:900,color:s.color,margin:"0 0 4px"}}>{s.value}</p>
            <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",margin:0,textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <h3 style={{fontSize:15,fontWeight:800,color:"#1e293b",margin:0}}>June 2025</h3>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {[["#228756","Present"],["#dc2626","Absent"],["#d97706","Leave"],["#e2e8f0","Not Marked"]].map(([c,l]) => (
              <span key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#64748b"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}></span>{l}
              </span>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#94a3b8",padding:"4px 0"}}>{d}</div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {/* June 2025 starts on Sunday — firstDay = 0, no offset needed */}
          {Array.from({length:30},(_,i) => i+1).map(day => {
            const status = ATTENDANCE[day];
            const dc = DOT_COLOR[status] || null;
            return (
              <div key={day} style={{
                aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",borderRadius:10,
                border:`1.5px solid ${dc||"#f1f5f9"}`,
                background:dc?"rgba(0,0,0,0.015)":"transparent",
              }}>
                <span style={{fontSize:isMobile?11:12,fontWeight:600,color:dc||"#cbd5e0"}}>{day}</span>
                {dc && <span style={{width:5,height:5,borderRadius:"50%",background:dc,marginTop:2}}></span>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Tab: Progress ─────────────────────────────────────────────────────────────

function ProgressTab({isMobile}) {
  const weekH     = WEEK_HOURS.reduce((s,d) => s+d.h, 0);
  const totalLogged = 87.5, reqH = 200;
  const pct       = Math.round((totalLogged / reqH) * 100);
  const maxH      = Math.max(...WEEK_HOURS.map(d => d.h));

  const milestones = [
    {label:"Orientation Complete",  hours:25,  done:true},
    {label:"Mid-term Review",       hours:50,  done:true},
    {label:"Supervisor Evaluation", hours:100, done:false},
    {label:"Certificate Eligible",  hours:200, done:false},
  ];

  return (
    <div>
      <Card style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div>
            <SecLabel>Hours This Week</SecLabel>
            <p style={{fontSize:28,fontWeight:900,color:"#1e293b",margin:"0 0 2px"}}>{weekH}<span style={{fontSize:14,color:"#94a3b8",fontWeight:600}}>h</span></p>
            <p style={{fontSize:12,color:"#94a3b8",margin:0}}>Target: 30h / week</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:12,color:"#94a3b8",margin:"0 0 4px"}}>Total Logged</p>
            <p style={{fontSize:24,fontWeight:900,color:"#228756",margin:"0 0 2px"}}>{totalLogged}h</p>
            <p style={{fontSize:11,color:"#94a3b8",margin:0}}>of {reqH}h required</p>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{display:"flex",gap:8,alignItems:"flex-end",height:110,marginBottom:20}}>
          {WEEK_HOURS.map((d,i) => (
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              {d.h > 0 && <span style={{fontSize:10,fontWeight:700,color:"#228756"}}>{d.h}h</span>}
              <div style={{
                width:"100%",borderRadius:"6px 6px 0 0",
                background:d.h?"linear-gradient(to top,#1b5e20,#2ecc71)":"#f1f5f9",
                height:`${maxH > 0 ? (d.h/maxH)*90 : 4}px`,
                minHeight:4,transition:"height 0.4s ease",
              }}/>
              <span style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>{d.day}</span>
            </div>
          ))}
        </div>

        <div style={{paddingTop:16,borderTop:"1px solid #f1f5f9"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700,color:"#374151"}}>Overall Progress</span>
            <span style={{fontSize:12,fontWeight:800,color:"#228756"}}>{pct}%</span>
          </div>
          <div style={{height:8,background:"#f1f5f9",borderRadius:10,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(to right,#1b5e20,#2ecc71)",borderRadius:10}}/>
          </div>
          <p style={{fontSize:11,color:"#94a3b8",margin:"6px 0 0"}}>{reqH-totalLogged}h remaining to complete the program</p>
        </div>
      </Card>

      <Card>
        <SecLabel>Milestones</SecLabel>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {milestones.map((m,i) => (
            <div key={i} style={{display:"flex",gap:14,alignItems:"center"}}>
              <div style={{
                width:36,height:36,borderRadius:"50%",flexShrink:0,
                background:m.done?"#228756":"#f1f5f9",
                border:`2px solid ${m.done?"#228756":"#e2e8f0"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                <i className={m.done?"feather-check":"feather-clock"} style={{fontSize:15,color:m.done?"#fff":"#94a3b8"}}></i>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:700,color:m.done?"#1e293b":"#94a3b8"}}>{m.label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:m.done?"#228756":"#94a3b8"}}>{m.hours}h {m.done?"✓":""}</span>
                </div>
                <div style={{height:5,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(100,Math.round((totalLogged/m.hours)*100))}%`,background:m.done?"#228756":"linear-gradient(to right,#1b5e20,#2ecc71)",borderRadius:4}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab: Resources ────────────────────────────────────────────────────────────

function ResourcesTab({isMobile}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
      {RESOURCES.map((r,i) => (
        <Card key={i} style={{padding:"16px 20px",display:"flex",gap:14,alignItems:"center"}}>
          <div style={{width:44,height:44,borderRadius:12,background:`${r.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <i className={r.icon} style={{fontSize:20,color:r.color}}></i>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:700,color:"#1e293b",margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</p>
            <p style={{fontSize:11,color:"#94a3b8",margin:0}}>{r.type} · {r.size}</p>
          </div>
          <button style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#fff",color:"#374151",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <i className="feather-download" style={{fontSize:13}}></i> {!isMobile && "Download"}
          </button>
        </Card>
      ))}
    </div>
  );
}

// ── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab({user, isMobile}) {
  const personal = [
    {label:"Full Name",      value:user?.name||"—",  icon:"feather-user"},
    {label:"Email",          value:user?.email||"—", icon:"feather-mail"},
    {label:"Phone",          value:"—",              icon:"feather-phone"},
    {label:"City",           value:"—",              icon:"feather-map-pin"},
    {label:"College",        value:"—",              icon:"feather-book"},
    {label:"Degree",         value:"—",              icon:"feather-layers"},
    {label:"Specialization", value:"—",              icon:"feather-award"},
  ];

  const internInfo = [
    {label:"Internship Type", value:"Clinical Internship"},
    {label:"Mode",            value:"Hybrid"},
    {label:"Duration",        value:"3 Months"},
    {label:"Supervisor",      value:"Dr. Anjali Mehta"},
    {label:"Start Date",      value:"June 1, 2025"},
    {label:"End Date",        value:"August 31, 2025"},
    {label:"Status",          value:"Active"},
  ];

  return (
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:20}}>
      <Card>
        <SecLabel>Personal Information</SecLabel>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {personal.map((f,i) => (
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#f8fafc",border:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <i className={f.icon} style={{fontSize:13,color:"#94a3b8"}}></i>
              </div>
              <div>
                <p style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 2px"}}>{f.label}</p>
                <p style={{fontSize:13,fontWeight:600,color:"#1e293b",margin:0,wordBreak:"break-word"}}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SecLabel>Internship Details</SecLabel>
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {internInfo.map((f,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<internInfo.length-1?"1px solid #f8fafc":"none"}}>
              <span style={{fontSize:12,color:"#64748b",fontWeight:600}}>{f.label}</span>
              <span style={{fontSize:13,fontWeight:700,color:f.label==="Status"?"#228756":"#1e293b"}}>{f.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Tab: Certificates ─────────────────────────────────────────────────────────

function CertificatesTab({isMobile}) {
  const totalLogged = 87.5, reqH = 200;
  const pct = Math.round((totalLogged / reqH) * 100);

  const docs = [
    {title:"Internship Certificate",    desc:"Official certificate issued upon completing 200 hours.",                    icon:"feather-award",      color:"#f59e0b", locked:pct<80},
    {title:"Letter of Recommendation", desc:"LOR issued by your supervisor after successful program completion.",         icon:"feather-file-text",  color:"#228756", locked:pct<80},
    {title:"Participation Letter",      desc:"Proof of active internship participation — available immediately.",         icon:"feather-clipboard",  color:"#0ea5e9", locked:false},
  ];

  return (
    <div>
      <Card style={{marginBottom:20,background:"linear-gradient(135deg,#1b5e20,#228756)",border:"none",color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
          <div>
            <p style={{margin:"0 0 4px",fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(255,255,255,0.65)"}}>Certificate Eligibility</p>
            <p style={{margin:"0 0 10px",fontSize:22,fontWeight:900}}>{totalLogged}h <span style={{fontSize:14,opacity:0.7}}>/ {reqH}h required</span></p>
            <div style={{height:7,background:"rgba(255,255,255,0.2)",borderRadius:10,width:isMobile?"100%":240,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:"#a7f3d0",borderRadius:10}}/>
            </div>
            <p style={{margin:"8px 0 0",fontSize:12,color:"rgba(255,255,255,0.65)"}}>Unlock documents at 80% completion</p>
          </div>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:14,padding:"14px 20px",textAlign:"center",flexShrink:0}}>
            <p style={{margin:"0 0 2px",fontSize:30,fontWeight:900}}>{pct}%</p>
            <p style={{margin:0,fontSize:11,opacity:0.7}}>Complete</p>
          </div>
        </div>
      </Card>

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {docs.map((d,i) => (
          <Card key={i} style={{padding:"20px 22px"}}>
            <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:isMobile?"wrap":"nowrap"}}>
              <div style={{width:50,height:50,borderRadius:14,background:`${d.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}>
                <i className={d.icon} style={{fontSize:22,color:d.locked?"#cbd5e1":d.color}}></i>
                {d.locked && (
                  <div style={{position:"absolute",bottom:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <i className="feather-lock" style={{fontSize:9,color:"#fff"}}></i>
                  </div>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:"0 0 3px",fontSize:15,fontWeight:800,color:"#1e293b"}}>{d.title}</p>
                <p style={{margin:"0 0 6px",fontSize:12,color:"#64748b",lineHeight:1.5}}>{d.desc}</p>
                {d.locked && <p style={{margin:0,fontSize:11,color:"#94a3b8",fontStyle:"italic"}}>Complete {reqH-totalLogged}h more to unlock</p>}
              </div>
              <button disabled={d.locked} style={{
                padding:"10px 20px",borderRadius:10,flexShrink:0,
                background:d.locked?"#f8fafc":"linear-gradient(135deg,#1b5e20,#228756)",
                border:`1.5px solid ${d.locked?"#e2e8f0":"transparent"}`,
                color:d.locked?"#cbd5e1":"#fff",fontSize:13,fontWeight:700,
                cursor:d.locked?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:7,
              }}>
                <i className={d.locked?"feather-lock":"feather-download"} style={{fontSize:13}}></i>
                {d.locked?"Locked":"Download"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TraineeDashboard() {
  const router = useRouter();
  const [user, setUser]             = useState(null);
  const [tab, setTab]               = useState("overview");
  const [tasks, setTasks]           = useState(MOCK_TASKS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const decoded = getDecodedToken();
    if (!decoded) { router.push("/intern-login"); return; }
    setUser(decoded);
  }, [router]);

  const logout = () => { removeToken(); router.push("/intern-login"); };

  const TAB_TITLE = {overview:"Overview", tasks:"My Tasks", attendance:"Attendance", progress:"Progress", resources:"Resources", profile:"My Profile", certificates:"Certificates"};

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Trainee Psychologist Dashboard | Choose Your Therapist</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html:`
        *{box-sizing:border-box;}
        body{margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f1f5f9;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#f1f5f9;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px;}
        .nav-btn:hover{background:rgba(255,255,255,0.08)!important;}
        .logout-btn:hover{color:rgba(255,255,255,0.7)!important;}
      `}} />

      <div style={{display:"flex",minHeight:"100vh"}}>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:199}}/>
        )}

        {/* ── SIDEBAR ── */}
        <aside style={{
          width:240, flexShrink:0, background:"#0f172a",
          display:"flex", flexDirection:"column",
          position:isMobile?"fixed":"sticky", top:0, left:0,
          height:"100vh", zIndex:200,
          transform:isMobile?(sidebarOpen?"translateX(0)":"translateX(-100%)"):"none",
          transition:"transform 0.3s ease",
          boxShadow:isMobile&&sidebarOpen?"4px 0 24px rgba(0,0,0,0.3)":"none",
          overflowY:"auto",
        }}>

          {/* Logo */}
          <div style={{padding:"22px 20px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1b5e20,#2ecc71)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <i className="feather-user-check" style={{fontSize:16,color:"#fff"}}></i>
              </div>
              <div>
                <p style={{margin:0,fontSize:13,fontWeight:800,color:"#fff",lineHeight:1.2}}>Trainee Portal</p>
                <p style={{margin:0,fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:600}}>CYT Internship</p>
              </div>
            </div>
          </div>

          {/* User info */}
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#228756,#2ecc71)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"#fff",fontWeight:900,fontSize:15}}>{(user.name||"T").charAt(0).toUpperCase()}</span>
              </div>
              <div style={{minWidth:0}}>
                <p style={{margin:"0 0 3px",fontSize:12,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name||"Trainee"}</p>
                <span style={{fontSize:10,fontWeight:700,background:"rgba(34,135,86,0.25)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.25)",borderRadius:20,padding:"1px 8px"}}>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{flex:1,padding:"12px",overflowY:"auto"}}>
            <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",letterSpacing:"1.5px",margin:"4px 8px 10px"}}>Menu</p>
            {NAV.map(n => (
              <button key={n.id} className="nav-btn" onClick={() => { setTab(n.id); if(isMobile) setSidebarOpen(false); }}
                style={{
                  width:"100%",display:"flex",alignItems:"center",gap:11,padding:"10px 12px",
                  borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",marginBottom:2,
                  background:tab===n.id?"linear-gradient(135deg,#1b5e20,#228756)":"transparent",
                  color:tab===n.id?"#fff":"rgba(255,255,255,0.5)",
                  fontFamily:"inherit",fontSize:13,fontWeight:tab===n.id?700:500,
                  transition:"background 0.15s, color 0.15s",
                }}>
                <i className={n.icon} style={{fontSize:15,flexShrink:0}}></i>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div style={{padding:"12px",borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
            <button className="logout-btn" onClick={logout} style={{
              width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
              borderRadius:10,border:"none",cursor:"pointer",
              background:"transparent",color:"rgba(255,255,255,0.35)",
              fontFamily:"inherit",fontSize:13,fontWeight:600,transition:"color 0.15s",
            }}>
              <i className="feather-log-out" style={{fontSize:15}}></i> Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>

          {/* Top bar */}
          <header style={{
            background:"#fff",borderBottom:"1.5px solid #f1f5f9",
            padding:"0 20px",height:60,display:"flex",alignItems:"center",
            justifyContent:"space-between",position:"sticky",top:0,zIndex:100,
            boxShadow:"0 1px 8px rgba(0,0,0,0.04)",flexShrink:0,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {isMobile && (
                <button onClick={() => setSidebarOpen(true)}
                  style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:6,borderRadius:8,display:"flex"}}>
                  <i className="feather-menu" style={{fontSize:20}}></i>
                </button>
              )}
              <div>
                <h1 style={{fontSize:16,fontWeight:800,color:"#1e293b",margin:0,lineHeight:1.2}}>{TAB_TITLE[tab]}</h1>
                {!isMobile && <p style={{fontSize:11,color:"#94a3b8",margin:0}}>Trainee Psychologist Dashboard</p>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {!isMobile && <span style={{fontSize:12,color:"#64748b",fontWeight:600}}>{user.name||""}</span>}
              <button onClick={logout} style={{
                background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:8,
                padding:"6px 14px",color:"#64748b",fontSize:12,fontWeight:700,
                cursor:"pointer",display:"flex",alignItems:"center",gap:6,
              }}>
                <i className="feather-log-out" style={{fontSize:13}}></i>
                {!isMobile && "Sign Out"}
              </button>
            </div>
          </header>

          {/* Content */}
          <main style={{flex:1,padding:isMobile?"16px":"28px",overflowY:"auto"}}>
            {tab === "overview"     && <OverviewTab     user={user} tasks={tasks} isMobile={isMobile} setTab={setTab}/>}
            {tab === "tasks"        && <TasksTab        tasks={tasks} setTasks={setTasks} isMobile={isMobile}/>}
            {tab === "attendance"   && <AttendanceTab   isMobile={isMobile}/>}
            {tab === "progress"     && <ProgressTab     isMobile={isMobile}/>}
            {tab === "resources"    && <ResourcesTab    isMobile={isMobile}/>}
            {tab === "profile"      && <ProfileTab      user={user} isMobile={isMobile}/>}
            {tab === "certificates" && <CertificatesTab isMobile={isMobile}/>}
          </main>
        </div>
      </div>
    </>
  );
}
