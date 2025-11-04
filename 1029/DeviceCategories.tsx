import { useNavigate } from "react-router-dom";
import { Smartphone, Laptop, Tablet, Monitor, Headphones, Watch, Tv, Wind, Refrigerator, MonitorSmartphone, CookingPot, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const electronicsCategories = [
  {
    icon: Smartphone,
    title: "스마트폰",
    description: "화면, 배터리, 성능 문제",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Laptop,
    title: "노트북",
    description: "부팅, 속도, 하드웨어 문제",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: MonitorSmartphone,
    title: "컴퓨터",
    description: "부팅, 하드웨어, 프로그램 문제",
    gradient: "from-slate-500 to-gray-500",
  },
  {
    icon: Tablet,
    title: "태블릿",
    description: "터치, 배터리, 앱 문제",
    gradient: "from-teal-500 to-green-500",
  },
  {
    icon: Headphones,
    title: "이어폰/헤드폰",
    description: "소리, 연결, 충전 문제",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Watch,
    title: "스마트워치",
    description: "배터리, 센서, 연결 문제",
    gradient: "from-purple-500 to-pink-500",
  },
];

const applianceCategories = [
  {
    icon: Monitor,
    title: "모니터",
    description: "화면, 연결, 색상 문제",
    gradient: "from-blue-600 to-indigo-500",
  },
  {
    icon: Tv,
    title: "TV",
    description: "화면, 리모컨, 연결 문제",
    gradient: "from-purple-600 to-pink-500",
  },
  {
    icon: Wind,
    title: "에어컨",
    description: "냉방, 소음, 필터 문제",
    gradient: "from-cyan-600 to-blue-500",
  },
  {
    icon: Refrigerator,
    title: "냉장고",
    description: "냉각, 소음, 얼음 문제",
    gradient: "from-teal-600 to-green-500",
  },
  {
    icon: CookingPot,
    title: "전자레인지",
    description: "가열, 버튼, 회전 문제",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Flame,
    title: "인덕션",
    description: "가열, 온도, 전원 문제",
    gradient: "from-red-600 to-orange-600",
  },
];

const DeviceCategories = () => {
  const navigate = useNavigate();

  const renderCategories = (categories: typeof electronicsCategories) => (
    <div className="grid md:grid-cols-3 gap-6">
      {categories.map((category, index) => {
        const Icon = category.icon;
        return (
          <button
            key={index}
            onClick={() => navigate("/diagnose")}
            className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-left group"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {category.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {category.description}
            </p>
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="categories" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          어떤 기기를 진단하시겠습니까?
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          카테고리를 선택하고 문제를 설명하세요
        </p>

        <Tabs defaultValue="electronics" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="electronics">전자기기</TabsTrigger>
            <TabsTrigger value="appliances">가전제품</TabsTrigger>
          </TabsList>
          
          <TabsContent value="electronics" className="animate-fade-in">
            {renderCategories(electronicsCategories)}
          </TabsContent>
          
          <TabsContent value="appliances" className="animate-fade-in">
            {renderCategories(applianceCategories)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DeviceCategories;
