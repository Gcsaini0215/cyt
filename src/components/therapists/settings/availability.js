import React, { useEffect, useState } from "react";
import "./availability.css";
import { allTimes } from "../../../utils/static-lists";
import useTherapistStore from "../../../store/therapistStore";
import FormProgressBar from "../../global/form-progressbar";
import FormMessage from "../../global/form-message";
import { postData } from "../../../utils/actions";
import {
  updateAvailabilitiesUrl,
} from "../../../utils/url";

const Availability = ({ onSuccess }) => {
  const { therapistInfo, times, setTimes, setTimesAll, addOvertime, deleteOvertime } =
    useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTimeChange = (day, index, type, value) => {
    setTimes(day, index, type, value);
  };

  const validateTimes = () => {
    const allEmpty = Object.values(times).every((dayTimes) =>
      dayTimes.every((timeSlot) => !timeSlot.open && !timeSlot.close)
    );

    return !allEmpty;
  };

  const handleSubmit = async () => {
    if (validateTimes()) {
      setError("");
      const schedule = transformTimesToSchedule(times);
      const data = {
        schedule: schedule,
      };
      try {
        setLoading(true);
        const response = await postData(updateAvailabilitiesUrl, data);
        if (response.status) {
          setSuccess(response.message);
          setError("");
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError("Something went wrong");
        }
      } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong");
      }
      setLoading(false);
    } else {
      setError("Please select fill times");
    }
  };

  const transformTimesToSchedule = (times) => {
    return Object.entries(times).reduce((schedule, [day, times]) => {
      const validTimes = times.filter(
        (time) => time.open !== "" && time.close !== ""
      );
      if (validTimes.length > 0) {
        schedule.push({ day, times: validTimes });
      }
      return schedule;
    }, []);
  };

  const transformScheduleToTimes = (schedule) => {
    const initialTimes = {
      Monday: [{ open: "", close: "" }],
      Tuesday: [{ open: "", close: "" }],
      Wednesday: [{ open: "", close: "" }],
      Thursday: [{ open: "", close: "" }],
      Friday: [{ open: "", close: "" }],
      Saturday: [{ open: "", close: "" }],
      Sunday: [{ open: "", close: "" }],
    };

    if (schedule && Array.isArray(schedule)) {
      schedule.forEach(({ day, times }) => {
        if (!initialTimes[day]) {
          initialTimes[day] = [];
        }
        initialTimes[day] = times.map((time) => ({
          open: time.open,
          close: time.close,
        }));
      });
    }

    return initialTimes;
  };

  useEffect(() => {
    if (!hasInitialized && therapistInfo?.user?.email) {
      const transformedTimes = transformScheduleToTimes(therapistInfo.availabilities);
      if (therapistInfo.availabilities && therapistInfo.availabilities.length > 0) {
        setTimesAll(transformedTimes);
      }
      setHasInitialized(true);
    }
  }, [therapistInfo?.user?.email, therapistInfo.availabilities, hasInitialized]);

  const selectStyle = { lineHeight: "20px", height: "45px", borderRadius: "8px" };

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div className="rbt-table-wrapper">
        <table className="rbt-table table table-borderless">
          <thead>
            <tr>
              <th>Days</th>
              <th>Opens at</th>
              <th>Closes at</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(times).map((day) => (
              <React.Fragment key={day}>
                {times[day].map((time, index) => (
                  <tr key={`${day}-${index}`}>
                    <th style={{ verticalAlign: 'middle' }}>{index === 0 ? day : ""}</th>
                    <td>
                      <div className="rbt-form-group mb--0">
                        <select
                          style={selectStyle}
                          value={time.open}
                          onChange={(e) =>
                            handleTimeChange(day, index, "open", e.target.value)
                          }
                        >
                          <option value="">Select Time</option>
                          {allTimes.map((timeOption) => (
                            <option key={timeOption} value={timeOption}>
                              {timeOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="rbt-form-group mb--0">
                        <select
                          style={selectStyle}
                          value={time.close}
                          onChange={(e) =>
                            handleTimeChange(day, index, "close", e.target.value)
                          }
                        >
                          <option value="">Select Time</option>
                          {allTimes.map((timeOption) => (
                            <option key={timeOption} value={timeOption}>
                              {timeOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {index === 0 ? (
                        <button
                          className="rbt-btn btn-gradient btn-sm"
                          style={{ height: 35, width: 35, padding: 0, minWidth: 35 }}
                          onClick={() => addOvertime(day)}
                        >
                          <i className="feather-plus"></i>
                        </button>
                      ) : (
                        <button
                          className="rbt-btn btn-pink btn-sm"
                          style={{ height: 35, width: 35, padding: 0, minWidth: 35 }}
                          onClick={() => deleteOvertime(day, index)}
                        >
                          <i className="feather-trash-2"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <FormMessage error={error} success={success} />
      <div className="col-12 mt--20">
        <div className="rbt-form-group d-none">
          <button className="rbt-btn btn-gradient submit-btn" onClick={handleSubmit}>
            Update
          </button>
        </div>
        {loading && <FormProgressBar />}
      </div>
    </div>
  );
};

export default Availability;
