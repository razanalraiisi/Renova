import axios from "axios";

const API_URL = "http://localhost:5000/admin/faqs";

export const getFAQs = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createFAQ = async (faq) => {
  const res = await axios.post(API_URL, faq);
  return res.data;
};

export const updateFAQ = async (id, faq) => {
  const res = await axios.put(`${API_URL}/${id}`, faq);
  return res.data;
};

export const deleteFAQ = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};