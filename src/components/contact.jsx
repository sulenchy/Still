import { useState } from "react";
import { kicker, editorial, fieldClass, primaryButton } from "../constants/class-names";
import { BrandIcon } from "./brand-icon.jsx";
import { ArrowIcon } from "./arrow-icon.jsx";
import {Topics} from "../constants/data";

export const Contact = () => {
  const emptyMessage = { name: "", email: "", topic: "", message: "" };

  const [values, setValues] = useState(emptyMessage);
  const [errors, setErrors] = useState(emptyMessage);
  const [status, setStatus] = useState("idle");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const validateForm = (values) => {
    const errors = {};
    if (!values.name.trim()) errors.name = "Name is required";
    if (!values.email.trim()) errors.email = "Email is required";
    if (!values.topic.trim()) errors.topic = "Topic is required";
    if (!values.message.trim()) errors.message = "Message is required";
    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("submitting");
    const newErrors = validateForm(values);
    setErrors(newErrors);

    if (Object.keys(newErrors).length) {
      setStatus("failed");
    }

    // Simulate form submission
    // I could use a real API call here
    setTimeout(() => {
      setStatus("success");
      setValues(emptyMessage);
    }, 2000);
  };


  return (
    <section
      className="grid grid-cols-1 items-center gap-[9vw] px-5 py-20 desk:grid-cols-[0.82fr_1.18fr] desk:px-[clamp(24px,8vw,125px)] desk:py-[120px]"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div>
        <span className={kicker}>WE’RE HERE TO HELP</span>
        <h2 id="contact-title" className={`${editorial} mt-[17px] mb-6 text-[54px]`}>
          Have a question?<br /><em className="font-normal text-peach">Let’s talk.</em>
        </h2>
        <p className="max-w-[480px] text-[13px] leading-[1.75] text-muted">
          Whether you’re thinking about starting an archive, bringing your
          family in, or preserving something especially meaningful, we’d love
          to hear from you.
        </p>
        <div className="my-[35px] grid grid-cols-2 gap-5 border-y border-line py-[22px]">
          <span>
            <small className="mb-1.5 block text-[7px] tracking-[0.12em] text-peach">EMAIL US</small>
            <strong className="block font-serif text-[15px] leading-[normal] font-normal">
              hello@stillarchive.com
            </strong>
          </span>
          <span>
            <small className="mb-1.5 block text-[7px] tracking-[0.12em] text-peach">RESPONSE TIME</small>
            <strong className="block font-serif text-[15px] leading-[normal] font-normal">
              Usually within two working days
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-[13px] text-muted">
          <BrandIcon />
          <p className="max-w-[330px] text-[9px] leading-[1.5]">
            Your stories stay yours. We’ll only use your details to reply to
            this message.
          </p>
        </div>
      </div>
      <div className="flex min-h-[525px] bg-paper p-[clamp(25px,4vw,50px)] shadow-[0_20px_60px_#1e2e2817]">
        <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-5">
            <label>
              <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">Your name</span>
              <input
                className={fieldClass}
                placeholder="Anna Miller"
                required
                type="text"
                onChange={handleChange}
                name="name"
              />
            </label>
            <label>
              <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">Email address</span>
              <input
                className={fieldClass}
                placeholder="anna@example.com"
                required
                type="email"
                onChange={handleChange}
                name="email"
              />
            </label>
          </div>
          <label>
            <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
              What can we help with?
            </span>
            <select className={fieldClass} name="topic" required defaultValue="" onChange={handleChange}>
              <option value="" disabled>Choose a topic</option>
              {Topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-[9px] tracking-[0.08em] uppercase">Your message</span>
            <textarea
              className={fieldClass}
              name="message"
              rows="6"
              placeholder="Tell us what’s on your mind..."
              required
              onChange={handleChange}
            />
          </label>
          <div className="mt-auto flex flex-col items-start gap-5 desk:flex-row desk:items-center desk:justify-between">
            <small className="max-w-[220px] text-[8px] leading-[1.5] text-muted">
              By sending this form, you agree to our privacy policy.
            </small>
            <button type="submit" className={primaryButton}>
              Send message
              <ArrowIcon />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}