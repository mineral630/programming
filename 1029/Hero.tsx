import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-tech.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          전자기기 문제, AI가 해결합니다
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          스마트폰, 노트북, 태블릿 등 모든 전자기기의 문제를 AI가 진단하고 해결책을 제시합니다
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/diagnose")}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            진단 시작하기
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-lg px-8 py-6 h-auto font-semibold border-2 hover:border-primary transition-all"
          >
            기기 카테고리 보기
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
