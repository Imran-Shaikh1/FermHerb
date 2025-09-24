import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Shield, MapPin, FlaskConical, Package, Users, QrCode, Sparkles } from "lucide-react";

const Index = () => {
  const stakeholders = [
    {
      title: "Farmer",
      description: "Begin the sacred journey from seed to harvest",
      icon: Leaf,
      path: "/farmer",
      gradient: "from-earth-light to-nature-primary"
    },
    {
      title: "Collector",
      description: "Gather nature's gifts with care and respect",
      icon: Users,
      path: "/collector",
      gradient: "from-nature-primary to-earth-medium"
    },
    {
      title: "Processor",
      description: "Transform herbs with ancient wisdom",
      icon: Package,
      path: "/processor",
      gradient: "from-earth-medium to-warm-secondary"
    },
    {
      title: "Laboratory",
      description: "Verify purity through modern science",
      icon: FlaskConical,
      path: "/laboratory",
      gradient: "from-warm-secondary to-nature-primary"
    },
    {
      title: "Manufacturer",
      description: "Craft final products with integrity",
      icon: Shield,
      path: "/manufacturer",
      gradient: "from-nature-primary to-earth-light"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-background via-earth-background to-nature-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] repeat"></div>
        </div>

        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-nature-primary to-earth-medium rounded-full flex items-center justify-center shadow-2xl shadow-nature-primary/30">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-warm-accent animate-pulse" />
                </div>
              </div>
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-nature-primary via-earth-medium to-warm-accent bg-clip-text text-transparent leading-tight">
              FarmHerb
            </h1>
            
            <p className="text-xl md:text-2xl text-earth-dark/80 mb-4 font-light">
              Every herb tells a story of purity, tradition, and trust
            </p>
            
            <p className="text-lg text-earth-dark/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Journey through the complete lifecycle of Ayurvedic herbs — from sacred soil to your hands, 
              every step verified and transparent through blockchain technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-nature-primary to-earth-medium hover:from-nature-primary/90 hover:to-earth-medium/90 text-white shadow-lg shadow-nature-primary/30 px-8 py-6 text-lg rounded-full"
              >
                <Link to="/auth" className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Begin Your Journey
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-earth-medium text-earth-medium hover:bg-earth-medium/10 px-8 py-6 text-lg rounded-full border-2"
              >
                <Link to="/consumer" className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Scan & Discover
                </Link>
              </Button>

              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-gold text-gold hover:bg-gold/10 px-8 py-6 text-lg rounded-full border-2"
              >
                <Link to="/analytics" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stakeholder Journey */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-earth-dark mb-4">
            The Sacred Journey
          </h2>
          <p className="text-lg text-earth-dark/70 max-w-2xl mx-auto">
            Follow the path of transparency from farm to pharmacy. Each guardian of the journey adds their chapter to the story.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stakeholders.map((stakeholder, index) => (
            <Card 
              key={stakeholder.title}
              className="group hover:scale-105 transition-all duration-300 border-0 shadow-lg hover:shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden"
            >
              <CardContent className="p-6 text-center relative">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stakeholder.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                
                {/* Step Number */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-earth-medium/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-earth-medium">{index + 1}</span>
                </div>

                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${stakeholder.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <stakeholder.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-black mb-3">
                  {stakeholder.title}
                </h3>
                
                <p className="text-black mb-6 text-sm leading-relaxed">

                  {stakeholder.description}
                </p>

                {/* Action Button */}
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm"
                  className="w-full border-earth-medium/30 text-earth-medium hover:bg-earth-medium/10 group-hover:border-earth-medium"
                >
                  <Link to={stakeholder.path}>
                    Enter Portal
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/60 backdrop-blur-sm border-t border-earth-light/30">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-nature-primary to-earth-medium rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black
 mb-2">Blockchain Verified</h3>
              <p className="text-black/70">Every transaction immutably recorded for complete transparency</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-earth-medium to-warm-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">GPS Tracked</h3>
              <p className="text-black">Real-time location tracking from harvest to delivery</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-warm-accent to-nature-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Lab Certified</h3>
              <p className="text-black/70">Scientific validation ensuring purity and authenticity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-earth-dark text-black">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-nature-primary" />
              <span className="text-xl font-semibold">Sacred Origins</span>
            </div>
            <p className="text-earth-light">Preserving ancient wisdom through modern transparency</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
