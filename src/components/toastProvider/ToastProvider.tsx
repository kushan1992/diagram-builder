"use client";

import { ToastContainer } from "react-toastify";
// @ts-expect-error: side-effect CSS import without type declarations
import "react-toastify/dist/ReactToastify.css"; // Import the default styles

export default function ToastProvider() {
  return <ToastContainer position={"bottom-right"} autoClose={2500} />;
}
