"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FiSend } from "react-icons/fi";

export default function Contact() {
  const form = useRef<HTMLFormElement | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    emailjs
      .sendForm(
        "service_62nuv4n",
        "template_ybfmxir",
        form.current,
        "1NST2h1RZpgHS_Crd"
      )
      .then(() => {
        setToast({
          show: true,
          message: "Message sent successfully!",
          type: "success",
        });
        form.current?.reset();
        setTimeout(() => setToast({ ...toast, show: false }), 4000);
      })
      .catch(() => {
        setToast({
          show: true,
          message: "Failed to send message.",
          type: "error",
        });
        setTimeout(() => setToast({ ...toast, show: false }), 4000);
      });
  };

  return (
    <div className="">
      <form
        ref={form}
        onSubmit={sendEmail}
        className="mt-10 space-y-10 max-w-xl"
      >
        {/* NAME */}
        <div className="relative">
          <input
            name="from_name"
            required
            className="peer w-full bg-transparent border-b border-white/30 py-3 text-white focus:outline-none"
          />
          <label className="absolute left-0 top-3 text-sm text-white/60 peer-focus:-top-3 peer-focus:text-xs peer-valid:-top-3 peer-valid:text-xs">
            Your Name
          </label>
        </div>

        {/* EMAIL */}
        <div className="relative">
          <input
            type="email"
            name="from_email"
            required
            className="peer w-full bg-transparent border-b border-white/30 py-3 text-white focus:outline-none"
          />
          <label className="absolute left-0 top-3 text-sm text-white/60 peer-focus:-top-3 peer-focus:text-xs peer-valid:-top-3 peer-valid:text-xs">
            Email Address
          </label>
        </div>

        {/* MESSAGE */}
        <div className="relative">
          <textarea
            name="message"
            rows={4}
            required
            className="peer w-full bg-transparent border-b border-white/30 py-3 text-white resize-none focus:outline-none"
          />
          <label className="absolute left-0 top-3 text-sm text-white/60 peer-focus:-top-3 peer-focus:text-xs peer-valid:-top-3 peer-valid:text-xs">
            Your Message
          </label>
        </div>

        <button
          type="submit"
          className="group mt-4 inline-flex font-bold items-center gap-2 border rounded-full border-white px-6 py-3 text-sm  tracking-widest transition hover:bg-white hover:text-black"
        >
          Send Message
          <FiSend className="text-lg rotate-45 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </form>

      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-pop">
          <div
            className={`toast-border ${
              toast.type === "error" ? "toast-error" : "toast-success"
            }`}
          >
            <div className="toast-inner">
              <span
                className={`toast-text ${
                  toast.type === "error" ? "text-error" : "text-success"
                }`}
              >
                {toast.message}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
