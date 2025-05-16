import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, PackagePlus, Wand2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    title: "App Generator",
    description: "Generate a base CodeIgniter 4 app with folder structure and working code using AI.",
    href: "/app-generator",
    icon: <LayoutGrid className="h-8 w-8 text-primary mb-4" />,
    dataAiHint: "coding computer"
  },
  {
    title: "Module Creator",
    description: "Create CI4 packages (like auth, blog, API, etc.) with AI assistance.",
    href: "/module-creator",
    icon: <PackagePlus className="h-8 w-8 text-primary mb-4" />,
    dataAiHint: "software module"
  },
  {
    title: "Configurator",
    description: "Customize routes, models, views, and controllers step-by-step with AI prompts.",
    href: "/configurator",
    icon: <Wand2 className="h-8 w-8 text-primary mb-4" />,
    dataAiHint: "settings configuration"
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-12">
        <Image 
          src="https://placehold.co/300x150.png" 
          alt="CodeIgniter Studio Banner" 
          width={300} 
          height={150} 
          className="mx-auto mb-6 rounded-lg shadow-lg"
          data-ai-hint="coding abstract"
        />
        <h1 className="text-5xl font-bold text-primary mb-4">
          Welcome to CodeIgniter Studio
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Your AI-powered assistant for building and configuring CodeIgniter 4 applications with ease.
          Jumpstart your development, create modules, and customize your project using intuitive AI tools.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.title} className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="items-center text-center">
              {feature.icon}
              <CardTitle className="text-2xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-center text-foreground/70 mb-6">
                {feature.description}
              </CardDescription>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Link href={feature.href} passHref>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Go to {feature.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <footer className="text-center mt-16 py-8 border-t">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} CodeIgniter Studio. Built with Next.js and AI.
        </p>
      </footer>
    </div>
  );
}
