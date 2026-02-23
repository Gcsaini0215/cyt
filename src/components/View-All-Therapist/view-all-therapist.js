import React from "react";
import Link from "next/link";
import {
  GetFavriouteTherapistListUrl,
  getTherapistProfiles,
} from "../../utils/url";
import { fetchById, fetchData } from "../../utils/actions";
import ProfileCardVert from "../home/profile-card-vert.js";
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
  const [visibleCount, setVisibleCount] = React.useState(9);
  const resultsRef = React.useRef(null);

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        if (res && res.data) {
          setAllData(res.data || []);
          setCount(res.totalCount || res.data?.length || 0);
          setData(res.data?.slice(0, visibleCount) || []);
        }
      } catch (err) {
        console.error("Error fetching therapists:", err);
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
        console.log("Favorites fetch error (using frontend only):", err);
      }
    };

    getData();
    const tokenData = getDecodedToken();
    if (tokenData && tokenData.role !== 1) {
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
      <div className="rbt-page-banner-wrapper dark-premium-banner">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <div className="banner-content-inner text-center pt--50 pb--50 pt_sm--30 pb_sm--30">
                <div className="section-title">
                  <h1 className="title text-white mb--10">Find Your Therapist</h1>
                  <p className="description text-white-opacity mb--25">Expert mental health support, tailored to your needs.</p>
                </div>
                
                <div className="search-filter-card banner-integrated-search">
                  <div className="row g-3 align-items-center">
                    <div className="col-lg-12">
                      <div className="search-box-wrap">
                        <input 
                          type="text" 
                          placeholder="Search by name, concern, or language..." 
                          value={search} 
                          onChange={handleSearchChange} 
                          className="main-search-input"
                        />
                        <button className="search-icon-btn">
                          <i className="feather-search"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-lg-12">
                      <div className="filter-grid">
                        <div className="filter-item">
                          <select name="profile_type" value={filter.profile_type} onChange={handleChange} className="premium-select">
                            <option value="">Profile Type</option>
                            {profileTypeOptions.map((item, index) => <option key={index} value={item.value}>{renderOption(item)}</option>)}
                          </select>
                        </div>
                        <div className="filter-item">
                          <select name="services" value={filter.services} onChange={handleChange} className="premium-select">
                            <option value="">Services</option>
                            {services.map((item, index) => <option key={index} value={item}>{renderOption(item)}</option>)}
                          </select>
                        </div>
                        <div className="filter-item">
                          <select name="year_of_exp" value={filter.year_of_exp} onChange={handleChange} className="premium-select">
                            <option value="">Experience</option>
                            {ExpList.map((item, index) => <option key={index} value={item}>{renderOption(item)}</option>)}
                          </select>
                        </div>
                        <div className="filter-item">
                          <select name="language_spoken" value={filter.language_spoken} onChange={handleChange} className="premium-select">
                            <option value="">Language</option>
                            {languageSpoken.map((item, index) => <option key={index} value={typeof item === "string" ? item : item.value}>{renderOption(item)}</option>)}
                          </select>
                        </div>
                        <div className="filter-item">
                          <select name="state" value={filter.state} onChange={handleChange} className="premium-select">
                            <option value="">State</option>
                            {stateList.map((item, index) => <option key={index} value={typeof item === "string" ? item : item.value}>{renderOption(item)}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {allData.length > 0 && (
                  <div className="results-jump-container mt--30">
                    <button onClick={scrollToResults} className="results-jump-btn">
                      <span className="count-badge">{allData.length}</span>
                      <span className="text">Therapists Found</span>
                      <i className="feather-arrow-down-circle"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={resultsRef} className="rbt-section-gapTop rbt-section-gapBottom">
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
        .dark-premium-banner {
          position: relative;
          background-image: url('https://i.postimg.cc/5yf8k8ts/bg-image-12dabd.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: scroll;
          padding: 80px 0 60px 0;
          overflow: hidden;
          margin-top: 0px;
        }
        
        .dark-premium-banner::before {
          content: ' ';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1;
        }
        .text-white-opacity {
          color: rgba(255, 255, 255, 0.8);
        }
        .banner-content-inner {
          position: relative;
          z-index: 2;
        }
        
        .section-title {
          position: relative;
          z-index: 2;
        }
        
        .banner-integrated-search {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .search-box-wrap {
          position: relative;
          margin-bottom: 15px;
        }
        .main-search-input {
          width: 100%;
          padding: 12px 60px 12px 20px !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          font-size: 15px !important;
          background: #f8fafc !important;
        }
        .search-icon-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: #2ecc71;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }
        .premium-select {
          width: 100%;
          padding: 8px 10px !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          font-size: 13px !important;
          background-color: white !important;
        }
        
        /* Premium Card Styles */
        .therapist-premium-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
          border-color: #2ecc71 !important;
        }
        .card-image-wrap:hover .therapist-img {
          transform: scale(1.08);
        }
        .premium-badge {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
          backdrop-filter: blur(8px);
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .premium-badge.recommended {
          background: rgba(34, 135, 86, 0.9);
        }
        .premium-badge.verified {
          background: rgba(37, 99, 235, 0.9);
        }
        .price-overlay-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: white;
          color: #1e293b;
          padding: 5px 12px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          z-index: 2;
        }
        .meta-pill {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .meta-pill i {
          color: #2ecc71;
          font-size: 12px;
        }
        .btn-outline-premium:hover {
          background: #f8fafc;
          border-color: #2ecc71 !important;
          color: #2ecc71 !important;
        }
        .btn-fill-premium:hover {
          background: #1a6d45 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(34, 135, 86, 0.3) !important;
        }
        .bookmark-btn:hover {
          transform: scale(1.1);
        }
        .btn-load-more {
          background: linear-gradient(90deg, #2ecc71, #27ae60);
          color: #fff;
          border: none;
          padding: 14px 40px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .results-jump-container {
          position: relative;
          z-index: 2;
        }
        
        .results-jump-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 24px;
          border-radius: 100px;
          color: white;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 2;
        }
        .results-jump-btn:hover {
          background: white;
          color: #0d2b1c;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .count-badge {
          background: #2ecc71;
          color: white;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 800;
        }
        .results-jump-btn i {
          font-size: 18px;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-5px);}
          60% {transform: translateY(-3px);}
        }

        @media (max-width: 991px) {
          .filter-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .filter-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .filter-grid {
            grid-template-columns: 1fr;
          }
          .banner-integrated-search {
            padding: 15px;
          }
        }
      `}</style>
    </>
  );
}
