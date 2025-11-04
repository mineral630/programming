import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import ThemeToggle from "@/components/ThemeToggle";

const Diagnose = () => {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">AI 기기 진단</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!hasStarted ? (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                기기 문제를 설명해주세요
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                AI가 문제를 분석하고 최적의 해결책을 제시합니다
              </p>
              <div className="bg-card p-8 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-lg mb-4">예시 질문:</h3>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>스마트폰 배터리가 너무 빨리 닳아요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>노트북이 느려졌어요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>화면이 깜빡거려요</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-semibold">•</span>
                    <span>와이파이가 자주 끊겨요</span>
                  </li>
                </ul>
              </div>
              <Button
                size="lg"
                onClick={() => setHasStarted(true)}
                className="mt-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-6 h-auto font-semibold shadow-lg"
              >
                진단 시작하기
              </Button>
            </div>
          </div>
        ) : (
          <ChatInterface />
        )}
      </main>
    </div>
  );
};

export default Diagnose;
