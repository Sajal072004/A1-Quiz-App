import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-dark transition-colors w-full">
        <ThemeProvider>
          <Navbar />
          <main className="w-full min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
