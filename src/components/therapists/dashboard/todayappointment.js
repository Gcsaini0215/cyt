import React from "react";
import "./appointment.css";
import { defaultProfile } from "../../../utils/url";

export default function TodayAppointment({ data }) {
  const appointments = data || [];

  return (
    <div className="dashboard-card w-100">
      <div className="dashboard-card-head">
        <div className="header-title">
          <h5>Today Appointments</h5>
        </div>
      </div>
      <div className="dashboard-card-body">
        <div className="appointment-list">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <div className="patient-info-profile">
                  <a href="appointments.html" className="table-avatar1">
                    <img
                      src={appointment.imgSrc || defaultProfile}
                      alt={appointment.name || "Patient Avatar"}
                    />
                  </a>
                  <div className="patient-name-info">
                    <span>#{appointment.id}</span>
                    <p>
                      <a href="appointments.html">{appointment.name}</a>
                    </p>
                  </div>
                </div>
                <div className="appointment-date-created">
                  <p className="date-part">{appointment.date}</p>
                  <span className="badge table-badge">{appointment.badge}</span>
                </div>
                <div className="apponiment-actions d-flex align-items-center">
                  <a href="#" className="text-success-icon me-2">
                    <i className="fa-solid fa-check"></i>
                  </a>
                  <a href="#" className="text-danger-icon">
                    <i className="fa-solid fa-xmark"></i>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="no-appointments" style={{ padding: "20px", textAlign: "center" }}>
              No appointments for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
