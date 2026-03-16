"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Client = {
  name: string;
  company: string;
  trade: string;
  market: string;
  status: string;
  start_date: string;
};

type CampaignStat = {
  week_number: number;
  week_label: string;
  emails_sent: number;
  email_open_rate: number;
  email_reply_rate: number;
  linkedin_sent: number;
  linkedin_replies: number;
  calls_made: number;
  calls_connected: number;
  meetings_booked: number;
};

type Meeting = {
  id: string;
  company_name: string;
  contact_name: string;
  contact_title: string;
  meeting_date: string;
  status: string;
  notes: string;
};

export default function Dashboard() {
  const [client, setClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<CampaignStat[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/client-login";
        return;
      }

      const uid = session.user.id;

      const [clientRes, statsRes, meetingsRes] = await Promise.all([
        supabase.from("clients").select("*").eq("id", uid).single(),
        supabase.from("campaign_stats").select("*").eq("client_id", uid).order("week_number"),
        supabase.from("meetings").select("*").eq("client_id", uid).order("meeting_date", { ascending: false }),
      ]);

      setClient(clientRes.data);
      setStats(statsRes.data ?? []);
      setMeetings(meetingsRes.data ?? []);
      setLoading(false);
    };

    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/client-login";
  };

  const totalMeetings = stats.reduce((s, w) => s + w.meetings_booked, 0);
  const totalEmails = stats.reduce((s, w) => s + w.emails_sent, 0);
  const totalCalls = stats.reduce((s, w) => s + w.calls_made, 0);
  const totalLinkedIn = stats.reduce((s, w) => s + w.linkedin_sent, 0);
  const latestOpenRate = stats.length ? stats[stats.length - 1].email_open_rate : 0;
  const latestReplyRate = stats.length ? stats[stats.length - 1].email_reply_rate : 0;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#F7F4EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#8C8070", letterSpacing: "2px" }}>
          LOADING...
        </span>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F7F4EE" }}>
      {/* Top bar */}
      <div
        style={{
          background: "#1C2B2B",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: "3px", color: "#E8A020" }}>
            DEENO
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(247,244,238,0.5)", letterSpacing: "1px" }}>
              {client?.company}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "1.5px",
              padding: "8px 16px",
              background: "transparent",
              color: "rgba(247,244,238,0.5)",
              border: "1px solid rgba(247,244,238,0.15)",
              cursor: "pointer",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#F7F4EE";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(247,244,238,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(247,244,238,0.5)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(247,244,238,0.15)";
            }}
          >
            SIGN OUT
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 40px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#E8A020", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 }}>
            Campaign Dashboard
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: "2px", color: "#1C2B2B", lineHeight: 1, marginBottom: 8 }}>
            {client?.company ?? "Your Campaign"}
          </h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8C8070" }}>{client?.trade}</span>
            <span style={{ color: "#C8C1B3" }}>·</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8C8070" }}>{client?.market}</span>
            <span style={{ color: "#C8C1B3" }}>·</span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "1px",
                color: client?.status === "active" ? "#2D5A3D" : "#8C8070",
                background: client?.status === "active" ? "rgba(45,90,61,0.08)" : "#EEE9DF",
                padding: "2px 8px",
                border: `1px solid ${client?.status === "active" ? "rgba(45,90,61,0.2)" : "#C8C1B3"}`,
              }}
            >
              {client?.status?.toUpperCase() ?? "ACTIVE"}
            </span>
          </div>
        </div>

        {/* Summary stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 1,
            background: "#C8C1B3",
            border: "1px solid #C8C1B3",
            marginBottom: 40,
          }}
        >
          {[
            { label: "Meetings Booked", value: totalMeetings, highlight: true },
            { label: "Emails Sent", value: totalEmails },
            { label: "Open Rate", value: `${latestOpenRate}%` },
            { label: "Reply Rate", value: `${latestReplyRate}%` },
            { label: "Calls Made", value: totalCalls },
            { label: "LinkedIn Outreach", value: totalLinkedIn },
          ].map((s) => (
            <div key={s.label} style={{ background: "#F7F4EE", padding: "28px 24px" }}>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 48,
                  color: s.highlight ? "#E8A020" : "#1C2B2B",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8C8070", letterSpacing: "1px", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly breakdown */}
        {stats.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#E8A020", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "block", width: 24, height: 1, background: "#E8A020" }} />
              Weekly Breakdown
            </div>
            <div style={{ border: "1px solid #C8C1B3", background: "#C8C1B3", display: "flex", flexDirection: "column", gap: 1 }}>
              {stats.map((week) => (
                <div key={week.week_number} style={{ background: "#EEE9DF", padding: "20px 24px", display: "grid", gridTemplateColumns: "100px 1fr", gap: "0 24px", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#C8C1B3", lineHeight: 1 }}>{String(week.week_number).padStart(2, "0")}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#8C8070", letterSpacing: "1px", textTransform: "uppercase" }}>{week.week_label}</div>
                  </div>
                  <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                    {[
                      { label: "Emails", value: week.emails_sent },
                      { label: "Open Rate", value: `${week.email_open_rate}%` },
                      { label: "Replies", value: `${week.email_reply_rate}%` },
                      { label: "LinkedIn", value: week.linkedin_sent },
                      { label: "Calls", value: week.calls_made },
                      { label: "Meetings", value: week.meetings_booked, highlight: true },
                    ].map((d) => (
                      <div key={d.label}>
                        <div style={{ fontSize: 18, fontWeight: 600, color: d.highlight ? "#E8A020" : "#1C2B2B" }}>{d.value}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#8C8070", letterSpacing: "1px", textTransform: "uppercase" }}>{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meetings */}
        {meetings.length > 0 && (
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#E8A020", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "block", width: 24, height: 1, background: "#E8A020" }} />
              Booked Meetings
            </div>
            <div style={{ border: "1px solid #C8C1B3", background: "#C8C1B3", display: "flex", flexDirection: "column", gap: 1 }}>
              {meetings.map((m) => (
                <div key={m.id} style={{ background: "#F7F4EE", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1C2B2B", marginBottom: 4 }}>{m.company_name}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8C8070" }}>
                      {m.contact_name}{m.contact_title ? ` · ${m.contact_title}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {m.meeting_date && (
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8C8070" }}>
                        {new Date(m.meeting_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    )}
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        color: m.status === "completed" ? "#2D5A3D" : m.status === "cancelled" ? "#8C8070" : "#E8A020",
                        background: m.status === "completed" ? "rgba(45,90,61,0.08)" : m.status === "cancelled" ? "#EEE9DF" : "rgba(232,160,32,0.08)",
                        border: `1px solid ${m.status === "completed" ? "rgba(45,90,61,0.2)" : m.status === "cancelled" ? "#C8C1B3" : "rgba(232,160,32,0.25)"}`,
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.length === 0 && meetings.length === 0 && (
          <div
            style={{
              background: "#EEE9DF",
              border: "1px solid #C8C1B3",
              borderLeft: "3px solid #E8A020",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#1C2B2B", letterSpacing: "2px", marginBottom: 8 }}>
              CAMPAIGN LAUNCHING SOON
            </div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#8C8070" }}>
              Your results will appear here once the campaign goes live.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
