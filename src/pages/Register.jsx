import { useState } from "react";
import api from "../services/Api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
    lga: "",
    ward: "",
    unit: "",
    highest_qualification: "",
    employment_status: ""
  });

  const [passport, setPassport] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    data.append("passport", passport);

    try {
      const res = await api.post(
        "/api/volunteers/register",
        data
      );

      alert(
        `Registration Successful\n${res.data.registration_no}`
      );
    } catch (err) {
      console.log(err);
      alert("Registration Failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-5">
        AUM Volunteer Registration
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          placeholder="Full Name"
          className="w-full border p-3"
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
        />

        <input
          placeholder="Phone"
          className="w-full border p-3"
          onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value,
            })
          }
        />

        <select
          className="w-full border p-3"
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value,
            })
          }
        >
          <option>Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          type="number"
          placeholder="Age"
          className="w-full border p-3"
          onChange={(e) =>
            setFormData({
              ...formData,
              age: e.target.value,
            })
          }
        />

        <input
          type="file"
          className="w-full border p-3"
          onChange={(e) =>
            setPassport(e.target.files[0])
          }
        />

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}