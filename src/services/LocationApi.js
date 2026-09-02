import api from "./Api";

// ============================================================
// REGISTRATION LOCATIONS
// ============================================================

export const getLgas = async () => {
  const response = await api.get(
    "/api/volunteers/locations/lgas"
  );

  return response.data;
};

export const getWards = async (lga) => {
  const response = await api.get(
    "/api/volunteers/locations/wards",
    {
      params: { lga },
    }
  );

  return response.data;
};

export const getPollingUnits = async (wardId) => {
  const response = await api.get(
    "/api/volunteers/locations/polling-units",
    {
      params: {
        ward_id: wardId,
      },
    }
  );

  return response.data;
};

// ============================================================
// REGISTER VOLUNTEER COMPATIBILITY
// ============================================================

export const getLocationCatalog = async () => {
  const lgaResponse = await getLgas();

  const lgas = lgaResponse?.data || [];

  const locations = [];

  for (const lga of lgas) {
    const wardResponse = await getWards(lga);

    locations.push({
      lga,
      wards: wardResponse?.data || [],
    });
  }

  return {
    success: true,
    data: locations,
  };
};

// ============================================================
// ADMIN POLLING UNITS
// ============================================================

export const getAdminPollingUnits = async (params = {}) => {
  const response = await api.get(
    "/api/admin/polling-units",
    {
      params,
    }
  );

  return response.data;
};

// ============================================================
// DASHBOARD COMPATIBILITY
// ============================================================

export const getAdminLocationUnits = async (params = {}) => {
  return getAdminPollingUnits(params);
};

// ============================================================
// POLLING UNIT MEMBERS
// ============================================================

export const getPollingUnitMembers = async (pollingUnitId) => {
  const response = await api.get(
    `/api/admin/polling-units/${pollingUnitId}/members`
  );

  return response.data;
};

// ============================================================
// POLLING UNITS PAGE COMPATIBILITY
// ============================================================

export const getLocationUnitVolunteers = async (id) => {
  return getPollingUnitMembers(id);
};
