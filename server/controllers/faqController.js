import FAQ from "../models/faqModel.js";

// GET ALL FAQs
export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE FAQ
export const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const newFAQ = new FAQ({ question, answer });
    const savedFAQ = await newFAQ.save();

    res.status(201).json(savedFAQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );

    res.json(updatedFAQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE FAQ
export const deleteFAQ = async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};