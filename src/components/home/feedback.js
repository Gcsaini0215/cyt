import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Feedback() {
  const fallbackTestimonials = [
    {
      name: "Priya Patel",
      rating: 5,
      feedback:
        "The platform connected me with a fantastic therapist who truly understood my needs. I feel supported and empowered to work through my challenges.",
    },
    {
      name: "Prakshit",
      rating: 5,
      feedback:
        "I’ve had an incredible experience with my therapist. She’s helped me navigate tough times and I’ve learned so much about myself.",
    },
    {
      name: "Nandini",
      rating: 5,
      feedback:
        "This platform has been a lifesaver. My therapist is compassionate and skilled, providing the support I need to cope with my depression.",
    },
    {
      name: "Shivani",
      rating: 5,
      feedback:
        "Finding a therapist who really listens and understands me has made a world of difference. The platform made the process easy and stress-free.",
    },
  ];

  const [reviews, setReviews] = useState(fallbackTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoogleReviews = () => {
      const PLACE_ID = "ChIJq-mP6W7nDDkRgXwXf-CjUyo"; 

      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Script not loaded");
        setLoading(false);
        return;
      }

      try {
        // Create a dummy element for PlacesService
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        
        service.getDetails({
          placeId: PLACE_ID,
          fields: ['reviews']
        }, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place.reviews) {
            // Sort reviews by rating (highest first) and take top 5
            const sortedReviews = place.reviews
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map(rev => ({
                name: rev.author_name,
                feedback: rev.text,
                rating: rev.rating,
                profile_photo: rev.profile_photo_url
              }));
            
            if (sortedReviews.length > 0) {
              setReviews(sortedReviews);
            }
          } else {
            console.error("Places Service failed:", status);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error with Places Service:", error);
        setLoading(false);
      }
    };

    // Check if google is already available or wait a bit
    if (window.google) {
      fetchGoogleReviews();
    } else {
      const timer = setTimeout(() => {
        if (window.google) fetchGoogleReviews();
        else setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="rbt-testimonial-area bg-color-white rbt-section-gap">
      <div className="container">
        <div className="row align-items-end mb--60 g-5">
          <div className="col-lg-8 col-md-12 col-12">
            <div className="section-title text-start">
              <span className="subtitle bg-primary-opacity" style={{ color: '#228756', fontWeight: '800' }}>
                <i className="fab fa-google" style={{ marginRight: '8px' }}></i> 
                TRUSTED BY 500+ CLIENTS
              </span>
              <h2 className="title" style={{ fontWeight: '800', marginTop: '10px' }}>What Our Clients Say</h2>
              <p className="description mt--20" style={{ fontSize: '18px', color: '#666' }}>
                Real feedback from our Google Business community. We are proud to support your mental health journey.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 col-12">
            <div className="google-rating-summary" style={{ 
              background: '#f8fafc', 
              padding: '20px', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '30px', marginBottom: '10px' }} />
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1a202c' }}>4.9 / 5.0</div>
              <div className="rating" style={{ margin: '5px 0' }}>
                <i className="fa fa-star" style={{ color: '#ffb400' }}></i>
                <i className="fa fa-star" style={{ color: '#ffb400' }}></i>
                <i className="fa fa-star" style={{ color: '#ffb400' }}></i>
                <i className="fa fa-star" style={{ color: '#ffb400' }}></i>
                <i className="fa fa-star" style={{ color: '#ffb400' }}></i>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Based on 120+ Reviews</div>
            </div>
          </div>
        </div>

        <div className="row g-5">
          <Swiper
            spaceBetween={30}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            modules={[Autoplay]}
            className="mySwiper"
            style={{ padding: '20px 0 50px' }}
          >
            {reviews.map((t, index) => (
              <SwiperSlide key={index}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '24px',
                  padding: '30px',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '10px'
                }}>
                  <div className="inner" style={{ flexGrow: 1 }}>
                    <div className="clint-info-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div className="thumb">
                          {t.profile_photo ? (
                            <img src={t.profile_photo} alt={t.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="fa fa-user" style={{ color: '#228756' }}></i>
                            </div>
                          )}
                        </div>
                        <div className="client-info">
                          <h5 className="title" style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{t.name}</h5>
                          <span style={{ fontSize: '11px', color: '#228756', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                             Verified Client
                          </span>
                        </div>
                      </div>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" style={{ width: '18px', opacity: '0.6' }} />
                    </div>
                    
                    <div className="description" style={{ marginTop: '20px' }}>
                      <div className="rating" style={{ marginBottom: '12px' }}>
                        {Array(5).fill(0).map((_, i) => (
                          <i key={i} className="fa fa-star" style={{ color: i < t.rating ? '#ffb400' : '#e2e8f0', fontSize: '13px', marginRight: '2px' }}></i>
                        ))}
                      </div>
                      <p style={{ 
                        fontSize: '15px', 
                        lineHeight: '1.6', 
                        color: '#475569',
                        fontStyle: 'normal',
                        marginBottom: 0
                      }}>
                        {t.feedback.length > 160 ? t.feedback.substring(0, 160) + "..." : t.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="text-center mt--20">
          <a 
            href="https://www.google.com/search?q=Choose+Your+Therapist+LLP+Noida&ludocid=3050118671427501185#lrd=0x390ce76ee98fe9ab:0x2a53a3e07f177c81,3" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rbt-btn btn-border btn-sm"
            style={{ borderRadius: '50px', padding: '0 30px', height: '45px', lineHeight: '43px' }}
          >
            <span className="btn-text"><i className="fab fa-google" style={{ marginRight: '10px' }}></i> Review us on Google</span>
          </a>
        </div>
      </div>
    </div>
  );
}
