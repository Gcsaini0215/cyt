import { create } from "zustand";
import { fetchById } from "../utils/actions";
import { getTherapist } from "../utils/url";
import { EducationList } from "../utils/static-lists";
const initialTimes = {
  Monday: [{ open: "", close: "" }],
  Tuesday: [{ open: "", close: "" }],
  Wednesday: [{ open: "", close: "" }],
  Thursday: [{ open: "", close: "" }],
  Friday: [{ open: "", close: "" }],
  Saturday: [{ open: "", close: "" }],
  Sunday: [{ open: "", close: "" }],
};

const useTherapistStore = create((set) => ({
  paymentStore: {
    ac_name: "",
    ac_number: "",
    ifsc: "",
    upi: "",
  },
  feeInfo: {},
  therapistInfo: {
    user: {
      name: "",
      email: "",
      phone: "",
      profile: "",
      bio: "",
      age: "",
      gender: "",
      dob: ""
    },
    serve_type: "",
    profile_type: "",
    mode: "",
    profile_code: "",
    license_number: "",
    gender: "",
    state: "",
    office_address: "",
    year_of_exp: "",
    qualification: "",
    language_spoken: [],
    session_formats: [],
    services: "",
    experties: "",
    createdAt: "",
    updatedAt: "",
    fileKey: "",
    profileKey: "",
    othEducation: false,
    availabilities: [],
    fees: [],
  },
  times: initialTimes,
  profileSet: false,
  setProfileSet: (newProfileSet) => set({ profileSet: newProfileSet }),
  setTimes: (day, index, type, value) =>
    set((state) => {
      const updatedTimes = { ...state.times };
      updatedTimes[day][index][type] = value;
      return { times: updatedTimes };
    }),
  setTimesAll: (newTimes) => set(() => ({ times: newTimes })),
  addOvertime: (day) =>
    set((state) => {
      const updatedTimes = { ...state.times };
      updatedTimes[day].push({ open: "", close: "" });
      return { times: updatedTimes };
    }),
  deleteOvertime: (day, index) =>
    set((state) => {
      const updatedTimes = { ...state.times };
      updatedTimes[day].splice(index, 1);
      return { times: updatedTimes };
    }),

  setTherapistInfo: (data) =>
    set(() => ({
      therapistInfo: {
        ...data,
        user: {
          name: data?.user?.name || "",
          email: data?.user?.email || "",
          phone: data?.user?.phone || "",
          profile: data?.user?.profile || "",
          bio: data?.user?.bio || "",
          gender: data?.user.gender || "",
          age: data?.user.age || "",
        },
      },
    })),

  setInfo: (key, value) =>
    set((state) => {
      if (key.startsWith("user.")) {
        const field = key.split(".")[1];
        return {
          therapistInfo: {
            ...state.therapistInfo,
            user: { ...state.therapistInfo.user, [field]: value },
          },
        };
      }
      return {
        therapistInfo: { ...state.therapistInfo, [key]: value },
      };
    }),
  setFee: (serviceIndex, formatIndex, fee) =>
    set((state) => {
      const updatedFees = [...state.therapistInfo.fees];
      updatedFees[serviceIndex].formats[formatIndex].fee = fee; // store raw input
      return {
        therapistInfo: {
          ...state.therapistInfo,
          fees: updatedFees,
        },
      };
    }),
  setSessionFormats: (formats) =>
    set((state) => ({
      therapistInfo: {
        ...state.therapistInfo,
        session_formats: formats.split(",").map((item) => item.trim()),
      },
    })),
  fetchTherapistInfo: async () => {
    try {
      const response = await fetchById(getTherapist);
      if (response.status) {
        const fetchedData = response.data;

        fetchedData.session_formats = fetchedData.session_formats
          ? fetchedData.session_formats.split(",").map((item) => item.trim())
          : [];
        fetchedData.othEducation = !EducationList.some(
          (qualification) => fetchedData.qualification === qualification
        );

        fetchedData.language_spoken = fetchedData.language_spoken
          ? fetchedData.language_spoken.split(",").map((value) => ({
            value: value.trim(),
            label: value.trim(),
          }))
          : [];

        fetchedData.availabilities = fetchedData.availabilities
          ? fetchedData.availabilities.map((schedule) => ({
            day: schedule.day,
            times: schedule.times.map((time) => ({
              open: time.open,
              close: time.close,
            })),
          }))
          : [];

        fetchedData.fees = Array.isArray(fetchedData.fees) ? fetchedData.fees : [];

        set((state) => ({
          therapistInfo: { ...state.therapistInfo, ...fetchedData },
        }));

      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },

  setPaymentStore: (key, value) =>
    set((state) => ({ paymentStore: { ...state.paymentStore, [key]: value } })),
  setMultiplePaymentStore: (data) =>
    set((state) => ({ paymentStore: { ...state.paymentStore, ...data } })),
}));

/**
 *
 * set((newName) => ({ ac_name: newName }))
 */

useTherapistStore.subscribe((state) => {
  // console.log("state", state.therapistInfo);
});

export default useTherapistStore;
