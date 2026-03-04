import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Home } from "@/pages/Home";
import { DesignSystem } from "@/pages/DesignSystem";

/**
 * 根布局：Header + Landing + Design System + Footer。
 */
function App() {
  return (
    <BrowserRouter>
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/design-system" element={<DesignSystem />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
