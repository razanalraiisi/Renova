const FAQ_KEY = "faqs";

export const getFAQs = () => {
  try {
    const data = localStorage.getItem(FAQ_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading FAQs from localStorage:", error);
    return [];
  }
};

export const saveFAQs = (faqs) => {
  try {
    localStorage.setItem(FAQ_KEY, JSON.stringify(faqs));
  } catch (error) {
    console.error("Error saving FAQs to localStorage:", error);
  }
};
