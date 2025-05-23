import React, { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    alert("Thank you! Your message has been sent.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  } else {
    alert("Something went wrong. Please try again.");
  }
};


  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 text-sm space-y-4">
      <h2 className="text-lg font-bold text-center">Contact Us</h2>
      <input
        className="w-full border rounded p-2 bg-transparent"
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        className="w-full border rounded p-2 bg-transparent"
        type="email"
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        className="w-full border rounded p-2 bg-transparent"
        type="tel"
        name="phone"
        placeholder="Phone (optional)"
        value={formData.phone}
        onChange={handleChange}
      />
      <textarea
        className="w-full border rounded p-2 bg-transparent"
        name="message"
        rows="5"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded hover:opacity-80 transition"
      >
        Send
      </button>
    </form>
  );
}
