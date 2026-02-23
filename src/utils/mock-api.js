export const mockTherapists = [
  {
    _id: "1",
    user: {
      name: "Dr. Rahul Kumar",
      email: "rahul@example.com",
      profile: null,
      bio: "Experienced psychologist"
    },
    profile_type: "Clinical Psychologist",
    services: "Anxiety, Depression, Stress Management",
    state: "Delhi",
    year_of_exp: "5-10",
    language_spoken: "English, Hindi",
    fees: 500
  },
  {
    _id: "2",
    user: {
      name: "Dr. Priya Sharma",
      email: "priya@example.com",
      profile: null,
      bio: "Counselor specializing in relationship therapy"
    },
    profile_type: "Counselor",
    services: "Relationships, Family Issues",
    state: "Mumbai",
    year_of_exp: "3-5",
    language_spoken: "English, Hindi, Marathi",
    fees: 400
  },
  {
    _id: "3",
    user: {
      name: "Dr. Amit Singh",
      email: "amit@example.com",
      profile: null,
      bio: "Therapist with focus on cognitive behavior therapy"
    },
    profile_type: "Therapist",
    services: "OCD, Anxiety, PTSD",
    state: "Bangalore",
    year_of_exp: "8-10",
    language_spoken: "English, Hindi, Kannada",
    fees: 600
  }
];

export async function fetchMockData(params = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: true,
        data: mockTherapists,
        totalCount: mockTherapists.length
      });
    }, 500);
  });
}
