const FAQ_KEY = "faqs";

export const getFAQs = () => {
  const data = localStorage.getItem(FAQ_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFAQs = (faqs) => {
  localStorage.setItem(FAQ_KEY, JSON.stringify(faqs));
};
