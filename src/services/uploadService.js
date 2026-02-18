import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const uploadService = {
  // Upload single image file
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");

      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default uploadService;
