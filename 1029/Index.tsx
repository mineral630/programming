import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import DeviceCategories from "@/components/DeviceCategories";
import ThemeToggle from "@/components/ThemeToggle";
import { Wrench, Zap, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            AI 기반 스마트 진단
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">
            전자기기 문제를 빠르고 정확하게 해결하세요
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">즉시 진단</h3>
              <p className="text-muted-foreground">
                AI가 문제를 실시간으로 분석하여 빠르게 해결책을 제시합니다
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mb-6">
                <Wrench className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">맞춤 솔루션</h3>
              <p className="text-muted-foreground">
                기기별 특성을 고려한 정확한 해결 방법을 제공합니다
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">전문가 수준</h3>
              <p className="text-muted-foreground">
                수천 건의 사례를 학습한 AI가 전문가 수준의 조언을 제공합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Device Categories */}
      <DeviceCategories />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            지금 바로 진단 시작하기
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8">
            AI가 여러분의 기기 문제를 해결해 드립니다
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/diagnose")}
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            무료로 진단받기
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
