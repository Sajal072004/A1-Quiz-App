import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-dark transition-colors">
        <ThemeProvider>
          <Navbar />
          <main className="container mx-0 overflow-hidden">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
