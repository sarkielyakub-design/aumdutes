import axios from "axios";
import API_URL from "./Api";

const volunteerApi = axios.create({
  baseURL: `${API_URL}/api/volunteers`,
  timeout: 60000,
});

// ============================================================
// REGISTER AUM VOLUNTEER
// ============================================================

export const registerVolunteer = async (formData) => {
  const response = await volunteerApi.post(
    "/register",
    formData
  );

  return response.data;
};

// ============================================================
// GET VOLUNTEER
// ============================================================

export const getVolunteer = async (id) => {
  const response = await volunteerApi.get(`/${id}`);

  return response.data;
};

// ============================================================
// VERIFY VOLUNTEER
// ============================================================

export const verifyVolunteer = async (registrationNo) => {
  const response = await volunteerApi.get(
    `/verify/${registrationNo}`
  );

  return response.data;
};

// ============================================================
// GET ALL VOLUNTEERS
// ============================================================

export const getVolunteers = async () => {
  const response = await volunteerApi.get("/");

  return response.data;
};

// ============================================================
// VOLUNTEER STATISTICS
// ============================================================

export const getVolunteerStats = async () => {
  const response = await volunteerApi.get(
    "/stats/summary"
  );

  return response.data;
};

// ============================================================
// DOWNLOAD MEMBERSHIP / VOLUNTEER CARD
// ============================================================

export const downloadMembershipCard = (
  registrationNo
) => {
  return `${API_URL}/api/volunteers/membership-card/${registrationNo}`;
};