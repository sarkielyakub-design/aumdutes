import api from "./Api";

export const registerVolunteer = async (formData) => {
  const response = await api.post(
    "/api/volunteers/register",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
