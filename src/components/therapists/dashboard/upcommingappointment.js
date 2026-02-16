import React from "react";
import "./upcommingappointment.css";
import { defaultProfile } from "../../../utils/url";

export default function UpcomingAppointment({ data }) {
  const appointments = data || [];

  return (
    <div className="upcoming-appointments-wrapper">
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <div key={appointment.id} className="upcoming-appointment-card mt--40">
            <div className="title-card">
              <span>Upcoming Appointment</span>
            </div>
            <div className="upcoming-patient-info">
              <div className="info-details">
                <span className="img-avatar">
                  <img src={appointment.imgSrc || defaultProfile} alt="Img" />
                </span>
                <div className="name-info">
                  <span>#{appointment.id}</span>
                  <h6>{appointment.name}</h6>
                </div>
              </div>
              <div className="date-details">
                <span>{appointment.badge}</span>
                <h6>{appointment.date}</h6>
              </div>
            </div>
            <div className="circle-bg"></div>
            <div className="appointment-card-footer">
              <h5>
                <i className="fa-solid fa-video"></i>Video Appointment
              </h5>
              <div className="btn-appointments">
                <a href="#" className="btn">
                  Accept
                </a>
                <a href="#" className="btn">
                  Cancel
                </a>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="upcoming-appointment-card mt--40">
          <div className="title-card">
            <span>Upcoming Appointments</span>
          </div>
          <div style={{ padding: "20px", textAlign: "center" }}>
            No upcoming appointments
          </div>
        </div>
      )}
    </div>
  );
}
