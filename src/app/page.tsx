import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    title: "Package Creator",
    description: "Describe a CodeIgniter 4 package (like auth, blog, API). AI will generate a full project scaffold with this package integrated, including .env.",
    href: "/package-creator",
    icon: <PackagePlus className="h-8 w-8 text-primary mb-4" />,
    dataAiHint: "software package"
  }
];

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-12">
        <Image
          src="https://www.codeigniter.com/assets/icons/ci-logo.png"
          alt="CodeIgniter Logo"
          width={128}
          height={128}
          className="mx-auto mb-6 rounded-lg shadow-lg"
          data-ai-hint="logo company"
        />
        <h1 className="text-5xl font-bold text-primary mb-4">
          Welcome to CodeIgniter Studio
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Your AI-powered assistant for building CodeIgniter 4 application packages.
          Describe your desired package, and let AI generate a complete project scaffold for you.
        </p>
      </header>

      <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-md mx-auto">
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
               <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Package Creator Visual" 
                  width={600} 
                  height={400} 
                  className="rounded-md mb-6"
                  data-ai-hint={feature.dataAiHint}
                />
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
