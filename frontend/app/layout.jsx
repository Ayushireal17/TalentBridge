import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "../lib/auth";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "TalentBridge  AI-Powered Career Platform",
  description: "Bridge your talent to opportunities with AI-powered job matching, resume analysis, and career coaching.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#0f0a0a", color: "#f1e8e8", minHeight: "100vh" }}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a0f0f",
                color: "#f1e8e8",
                border: "1px solid #ffffff12",
                borderRadius: "12px",
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}