import { Card, CardContent } from "@mui/material";
import { Button, Avatar } from "@mui/material";
import { Star, LocationOn, Verified } from "@mui/icons-material";
import { imagePath } from "../../utils/url";
import { useRouter } from "next/router";

const TherapistCard = (props) => {
    const router = useRouter();
    const therapist = props.therapist;

    const handleClick = () => router.push(`/therapist-checkout/${therapist._id}`);


    return (
        <Card
            sx={{
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                maxWidth: '320px',
                mx: 'auto',
                '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    borderColor: '#228756',
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Therapist Image */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Avatar
                            src={`${imagePath}/${therapist.user.profile}`}
                            alt={therapist.user.name}
                            sx={{
                                width: 80,
                                height: 80,
                                border: '2px solid #228756',
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            backgroundColor: '#228756',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white',
                        }}>
                            <Verified sx={{ fontSize: 14, color: 'white' }} />
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                            fontWeight: 600,
                            fontSize: '17px',
                            margin: '0 0 4px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {therapist.user.name}
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#228756',
                            fontWeight: 500,
                            margin: '0 0 8px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {therapist.profile_type}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star sx={{ fontSize: 12, color: '#ffd700' }} />
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>4.8</span>
                            {therapist.year_of_exp && <span style={{ fontSize: '12px', color: '#666' }}>({therapist.year_of_exp})</span>}
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '12px',
                }}>
                    <LocationOn sx={{ fontSize: 12 }} />
                    <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {therapist.state} ,India
                    </span>
                </div>

                {/* Languages */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {therapist.language_spoken?.split(',').map((lang) => (
                        <span key={lang.trim()} style={{
                            display: 'inline-block',
                            backgroundColor: '#e8f5e9',
                            color: '#228756',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                        }}>{lang.trim()}</span>
                    ))}
                </div>
                {/* Book Button */}
                <Button
                    onClick={handleClick}
                    variant="contained"
                    fullWidth
                    sx={{
                        backgroundColor: '#228756',
                        '&:hover': {
                            backgroundColor: '#1a6b45',
                        },
                        fontWeight: 600,
                        fontSize: '16px',
                        textTransform: 'none',
                        borderRadius: '12px',
                        padding: '10px 16px',
                    }}
                >
                    Book Appointment
                </Button>
            </CardContent>
        </Card>
    );
};

export default TherapistCard;
