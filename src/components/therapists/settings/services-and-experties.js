import React, { useState } from "react";
import {
  services,
  dailyLiftIssuesList,
  therapyoptionlist,
  diagnoseslist,
  relationshipIssuesList,
} from "../../../utils/static-lists";

import { updateServiceExpertiesUrl } from "../../../utils/url";
import { postData } from "../../../utils/actions";
import FormMessage from "../../global/form-message";
import FormProgressBar from "../../global/form-progressbar";
import useTherapistStore from "../../../store/therapistStore";

export default function ServicesAndExperties({ onSuccess }) {
  const { therapistInfo, setInfo } = useTherapistStore();
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);

  React.useEffect(() => {
    if (!hasInitialized && therapistInfo?.user?.email) {
      if (therapistInfo.services) {
        setSelectedServices(therapistInfo.services.split(",").map((item) => item.trim()));
      }
      if (therapistInfo.experties) {
        setSelectedExpertise(therapistInfo.experties.split(",").map((item) => item.trim()));
      }
      setHasInitialized(true);
    }
  }, [therapistInfo?.user?.email, therapistInfo.services, therapistInfo.experties, hasInitialized]);

  const handleServiceChange = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleExpertiseChange = (expertise) => {
    setSelectedExpertise((prev) =>
      prev.includes(expertise)
        ? prev.filter((e) => e !== expertise)
        : [...prev, expertise]
    );
  };

  const handleSubmit = async () => {
    const reqData = {
      services: selectedServices.join(", "),
      experties: selectedExpertise.join(", "),
    };

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      const response = await postData(updateServiceExpertiesUrl, reqData);
      if (response.status) {
        setSuccess(response.message);
        setInfo("services", reqData.services);
        setInfo("experties", reqData.experties);
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
  };

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div className="rbt-profile-row rbt-default-form row row--15">
        <div className="col-12">
          <div className="rbt-form-group">
            <h5 className="mb--20">What services do you offer?</h5>
            <div className="row g-3">
              {services.map((service) => (
                <div key={service} className="col-lg-4 col-md-6">
                  <div className="rbt-checkbox-wrapper mb--5">
                    <input
                      type="checkbox"
                      id={service}
                      checked={selectedServices.includes(service)}
                      onChange={() => handleServiceChange(service)}
                    />
                    <label htmlFor={service}>{service}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 mt--40">
          <hr />
          <h5 className="mb--20 mt--20">Your Area of Expertise</h5>
          <div className="row g-4">
            <div className="col-lg-6">
              <h6 className="rbt-title-style-2 mb--15">Daily Life Issues</h6>
              <div className="row g-2">
                {dailyLiftIssuesList.map((issue) => (
                  <div key={issue} className="col-12">
                    <div className="rbt-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id={issue}
                        checked={selectedExpertise.includes(issue)}
                        onChange={() => handleExpertiseChange(issue)}
                      />
                      <label htmlFor={issue}>
                        {issue.split(/(?=[A-Z])/).join(" ")}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              
              <h6 className="rbt-title-style-2 mb--15 mt--30">Therapy Options</h6>
              <div className="row g-2">
                {therapyoptionlist.map((therapy) => (
                  <div key={therapy} className="col-12">
                    <div className="rbt-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id={therapy}
                        checked={selectedExpertise.includes(therapy)}
                        onChange={() => handleExpertiseChange(therapy)}
                      />
                      <label htmlFor={therapy}>{therapy}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <h6 className="rbt-title-style-2 mb--15">Diagnoses</h6>
              <div className="row g-2">
                {diagnoseslist.map((diagnosis) => (
                  <div key={diagnosis} className="col-12">
                    <div className="rbt-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id={diagnosis}
                        checked={selectedExpertise.includes(diagnosis)}
                        onChange={() => handleExpertiseChange(diagnosis)}
                      />
                      <label htmlFor={diagnosis}>{diagnosis}</label>
                    </div>
                  </div>
                ))}
              </div>

              <h6 className="rbt-title-style-2 mb--15 mt--30">Relationship Issues</h6>
              <div className="row g-2">
                {relationshipIssuesList.map((issue) => (
                  <div key={issue} className="col-12">
                    <div className="rbt-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id={issue}
                        checked={selectedExpertise.includes(issue)}
                        onChange={() => handleExpertiseChange(issue)}
                      />
                      <label htmlFor={issue}>{issue}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 mt--30">
          <FormMessage error={error} success={success} />
          <div className="rbt-form-group d-none">
             {/* Hidden button for global trigger */}
            <button className="rbt-btn btn-gradient submit-btn" onClick={handleSubmit}>
              Update
            </button>
          </div>
          {loading && <FormProgressBar />}
        </div>
      </div>
    </div>
  );
}
