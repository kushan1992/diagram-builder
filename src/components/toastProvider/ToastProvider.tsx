"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the default styles

export default function ToastProvider() {
  return <ToastContainer position={"bottom-right"} autoClose={2500} />;
}
