import axios from "axios";
import API_URL from "./Api";

const volunteerApi = axios.create({
  baseURL: `${API_URL}/api/volunteers`,
  timeout: 60000,
});

export const registerVolunteer = async (formData) => {
  const response = await volunteerApi.post(
    "/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getVolunteer = async (id) => {
  const response = await volunteerApi.get(`/${id}`);
  return response.data;
};

export const verifyVolunteer = async (registrationNo) => {
  const response = await volunteerApi.get(
    `/verify/${registrationNo}`
  );

  return response.data;
};

export const getVolunteers = async () => {
  const response = await volunteerApi.get("/");
  return response.data;
};

export const getVolunteerStats = async () => {
  const response = await volunteerApi.get(
    "/stats/summary"
  );

  return response.data;
};

export const downloadMembershipCard = (
  registrationNo
) => {
  return `${API_URL}/api/volunteers/membership-card/${registrationNo}`;
};