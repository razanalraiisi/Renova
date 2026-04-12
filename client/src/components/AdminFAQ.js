import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardTitle
} from "reactstrap";
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from "../services/FaqServices";
import './Components.css';

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      const data = await getFAQs();
      setFaqs(data);
    };
    fetchFAQs();
  }, []);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;

    if (editId !== null) {
      const updated = await updateFAQ(editId, { question, answer });
      setFaqs(faqs.map(faq => faq._id === editId ? updated : faq));
      setEditId(null);
    } else {
      const newFAQ = await createFAQ({ question, answer });
      setFaqs([newFAQ, ...faqs]);
    }

    setQuestion("");
    setAnswer("");
  };

  const handleEdit = (faq) => {
    setEditId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleDelete = async (id) => {
    await deleteFAQ(id);
    setFaqs(faqs.filter(faq => faq._id !== id));
  };

  return (
    <div className="admin-faq-container">
      <h3 style={{ textAlign: "center", color: "#006D90"}}>Manage FAQs</h3>
      <br/>

      {/* ❌ REMOVED key={faq._id} (this was causing the error) */}
      <Card className="faq-item">
        <CardBody>
          <CardTitle><b style={{color: "#006D90"}}>Add / Update FAQ</b></CardTitle>

          <Input
            placeholder="Enter question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mb-2"
          />

          <Input
            type="textarea"
            placeholder="Enter answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="mb-2"
          />

          <Button color="primary" onClick={handleSave}>
            {editId ? "Update FAQ" : "Add FAQ"}
          </Button>
        </CardBody>
      </Card>

      {faqs.map(faq => (
        <Card key={faq._id} className="faq-item">
          <CardBody>
            <strong>{faq.question}</strong>
            <p>{faq.answer}</p>

            <Button color="warning" size="sm" onClick={() => handleEdit(faq)}>
              Edit
            </Button>{" "}
            <Button color="danger" size="sm" onClick={() => handleDelete(faq._id)}>
              Delete
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default AdminFAQ;