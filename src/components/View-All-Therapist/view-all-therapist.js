import React from "react";
import { Link } from "react-router-dom";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import { fetchById, fetchData } from "../../utils/actions";
import ErrorPage from "../../pages/error-page";
import ProfileCardVert from "../home/profile-card-vert";
import { ExpList, languageSpoken, services, stateList } from "../../utils/static-lists";
import { getDecodedToken } from "../../utils/jwt";

export default function ViewAllTherapist() {
  const [data, setData] = React.useState([]);
  const [allData, setAllData] = React.useState([]);
  const [count, setCount] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [favrioutes, setFavrioutes] = React.useState([]);
  const timeoutRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(6);

  const [filter, setFilter] = React.useState({
    profile_type: "",
    services: "",
    year_of_exp: "",
    language_spoken: "",
    state: "",
    search: "",
    page: 1,
    pageSize: 1000,
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFilter((prevFilter) => ({
        ...prevFilter,
        search: value.length > 2 ? value : "",
      }));
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  React.useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await fetchData(getTherapistProfiles, filter);
        console.log("ViewAllTherapist API Response:", res);
        if (res && res.data) {
          setAllData(res.data || []);
          setCount(res.totalCount || res.data?.length || 0);
          setData(res.data?.slice(0, visibleCount) || []);
        } else {
          console.error("API returned failure:", res);
        }
      } catch (err) {
        return <ErrorPage />;
      } finally {
        setLoading(false);
      }
    };

    const getFavrioutes = async () => {
      try {
        const res = await fetchById(GetFavriouteTherapistListUrl);
        if (res && res.data) {
          setFavrioutes(res.data.therapists || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getData();
    const data = getDecodedToken();
    if (data && data.role !== 1) {
      getFavrioutes();
    }
  }, []);

  const profileTypeOptions = React.useMemo(() => {
    const types = allData.map((item) => item.profile_type).filter(Boolean);
    const uniqueTypes = [...new Set(types)];
    return uniqueTypes.map((type) => ({ label: type, value: type }));
  }, [allData]);

  React.useEffect(() => {
    let filtered = allData;

    if (filter.search) {
      const searchText = filter.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.user?.name || "").toLowerCase().includes(searchText) ||
          (item.services || "").toLowerCase().includes(searchText) ||
          (item.language_spoken || "").toLowerCase().includes(searchText) ||
          (item.state || "").toLowerCase().includes(searchText)
      );
    }

    if (filter.profile_type) {
      filtered = filtered.filter((item) => item.profile_type === filter.profile_type);
    }

    if (filter.services) {
      filtered = filtered.filter((item) => item.services?.includes(filter.services));
    }

    if (filter.year_of_exp) {
      filtered = filtered.filter((item) => (item.year_of_exp || "").trim() === filter.year_of_exp);
    }

    if (filter.language_spoken) {
      filtered = filtered.filter((item) => item.language_spoken?.includes(filter.language_spoken));
    }

    if (filter.state) {
      filtered = filtered.filter(
        (item) => (item.state || "").toLowerCase() === filter.state.toLowerCase()
      );
    }

    setData(filtered.slice(0, visibleCount));
  }, [filter, allData, visibleCount]);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 3);

  const renderOption = (item) =>
    typeof item === "string" ? item : item.label || item.value;

  return (
    <>
      <div className="rbt-page-banner-wrapper">
        <div className="rbt-banner-image"></div>
        <div className="rbt-banner-content">
          <div className="rbt-banner-content-top">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className=" title-wrapper">
                    <h1 className="title mb--0"> Search Therapist</h1>
                    <Link className="rbt-badge-2" to="#">
                      <div className="image">🎉</div> {count} Therapist
                    </Link>
                  </div>
                  <p className="description">Discover the right therapist for your unique needs, all in one place.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rbt-course-top-wrapper mt--40 mt_sm--20">
            <div className="container">
              <div className="row g-5 align-items-center">
                <div className="col-lg-5 col-md-12">
                  <div className="rbt-sorting-list d-flex flex-wrap align-items-center">
                    <div className="rbt-short-item">
                      <span className="course-index">
                        Showing {data.length} of {count}<span className="ms-1">results</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-lg-7 col-md-12">
                  <div className="rbt-sorting-list d-flex flex-wrap align-items-end justify-content-start justify-content-lg-end">
                    <div className="rbt-short-item">
                      <form action="#" className="rbt-search-style me-0">
                        <input type="text" placeholder="Search Your Therapist.." value={search} onChange={handleSearchChange} />
                        <button type="submit" className="rbt-search-btn rbt-round-btn"><i className="feather-search"></i></button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters always visible */}
              <div className="row mt-3 filter-row">
                <div className="col-md-2 col-6 mb-2">
                  <select name="profile_type" value={filter.profile_type} onChange={handleChange} className="form-select">
                    <option value="">Profile Type</option>
                    {profileTypeOptions.map((item, index) => <option key={index} value={item.value}>{renderOption(item)}</option>)}
                  </select>
                </div>
                <div className="col-md-2 col-6 mb-2">
                  <select name="services" value={filter.services} onChange={handleChange} className="form-select">
                    <option value="">Services</option>
                    {services.map((item, index) => <option key={index} value={item}>{renderOption(item)}</option>)}
                  </select>
                </div>
                <div className="col-md-2 col-6 mb-2">
                  <select name="year_of_exp" value={filter.year_of_exp} onChange={handleChange} className="form-select">
                    <option value="">Experience</option>
                    {ExpList.map((item, index) => <option key={index} value={item}>{renderOption(item)}</option>)}
                  </select>
                </div>

                <div className="col-md-3 col-6 mb-2">
                  <select name="language_spoken" value={filter.language_spoken} onChange={handleChange} className="form-select">
                    <option value="">Language</option>
                    {languageSpoken.map((item, index) => <option key={index} value={typeof item === "string" ? item : item.value}>{renderOption(item)}</option>)}
                  </select>
                </div>
                <div className="col-md-3 col-6 mb-2">
                  <select name="state" value={filter.state} onChange={handleChange} className="form-select">
                    <option value="">State</option>
                    {stateList.map((item, index) => <option key={index} value={typeof item === "string" ? item : item.value}>{renderOption(item)}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rbt-section-overlayping-top rbt-section-gapBottom">
        <div className="container">
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-5">
              {data.map((item) => (
                <div key={item._id} className="col-lg-4 col-md-6 col-sm-6 col-12 sal-animate" style={{ wordWrap: "break-word" }} data-sal-delay="150" data-sal="slide-up" data-sal-duration="800">
                  <ProfileCardVert data={item} favrioutes={favrioutes} />
                </div>
              ))}
            </div>
          )}

          {visibleCount < allData.length && (
            <div className="row">
              <div className="col-lg-12 text-center mt--40">
                <button onClick={handleLoadMore} className="btn-load-more">Load More</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .btn-load-more {
          background: linear-gradient(90deg, #28a745, #20c997);
          color: #fff;
          border: none;
          padding: 12px 30px;
          font-size: 16px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-load-more:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
        .form-select {
          font-size: 16px;
          padding: 8px 12px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .filter-row .col-md-2,
          .filter-row .col-md-3 {
            width: 48%;
          }
        }

        @media (min-width: 769px) {
          /* Desktop: make all dropdowns equal inline width */
          .filter-row .col-md-2, 
          .filter-row .col-md-3 {
            width: calc(100% / 5 - 10px); /* 5 dropdowns equally inline with small gap */
          }
        }
      `}</style>
    </>
  );
}
