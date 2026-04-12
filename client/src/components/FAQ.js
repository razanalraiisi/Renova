import {
  Col,
  UncontrolledAccordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  Input
} from "reactstrap";
import { useEffect, useState } from "react";
import { getFAQs } from "../services/FaqServices";
import "./Components.css";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchFAQs = async () => {
      try {
        const data = await getFAQs();
        if (isMounted) setFaqs(data || []);
      } catch (err) {
        if (isMounted) setFaqs([]);
      }
    };

    fetchFAQs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="faq-container">
      <Col style={{ textAlign: "center" }}>
        <h3 className="faq-title">Frequently Asked Questions</h3>

        <div className="faq-search-wrapper">
          <Input
            type="text"
            placeholder="Search FAQs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="faq-search-input"
          />
        </div>

        <div className="faq-accordion-wrapper">
          <UncontrolledAccordion stayOpen>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <AccordionItem key={faq._id} className="fade-in">
                  <AccordionHeader targetId={String(index)}>
                    {faq.question}
                  </AccordionHeader>
                  <AccordionBody accordionId={String(index)}>
                    {faq.answer}
                  </AccordionBody>
                </AccordionItem>
              ))
            ) : (
              <p className="no-results">No matching FAQs found.</p>
            )}
          </UncontrolledAccordion>
        </div>
      </Col>
    </div>
  );
};

export default FAQ;