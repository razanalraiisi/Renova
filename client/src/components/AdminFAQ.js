import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardTitle
} from "reactstrap";
import { getFAQs, saveFAQs } from "../services/FaqServices";
import './Components.css';

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setFaqs(getFAQs());
  }, []);

  const handleSave = () => {
    if (!question || !answer) return;

    let updatedFAQs;

    if (editId !== null) {
      updatedFAQs = faqs.map(faq =>
        faq.id === editId ? { ...faq, question, answer } : faq
      );
      setEditId(null);
    } else {
      updatedFAQs = [
        ...faqs,
        { id: Date.now(), question, answer }
      ];
    }

    setFaqs(updatedFAQs);
    saveFAQs(updatedFAQs);
    setQuestion("");
    setAnswer("");
  };

  const handleEdit = (faq) => {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const handleDelete = (id) => {
    const updatedFAQs = faqs.filter(faq => faq.id !== id);
    setFaqs(updatedFAQs);
    saveFAQs(updatedFAQs);
  };

  return (
    <div className="admin-faq-container">
      <h3 style={{ textAlign: "center", color: "#006D90"}}>Manage FAQs</h3>
      <br/>

      <Card className="faq-form">
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
        <Card key={faq.id} className="faq-item">
          <CardBody>
            <strong>{faq.question}</strong>
            <p>{faq.answer}</p>

            <Button color="warning" size="sm" onClick={() => handleEdit(faq)}>
              Edit
            </Button>{" "}
            <Button color="danger" size="sm" onClick={() => handleDelete(faq.id)}>
              Delete
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default AdminFAQ;
