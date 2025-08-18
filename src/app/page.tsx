
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getHomePageConfig() {
    try {
        const configRef = doc(db, 'config', 'homepage');
        const docSnap = await getDoc(configRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Default values if the document doesn't exist
            return {
                slogan: 'Descubra o sabor da natureza em cada gole. Nossos sumos são feitos com ingredientes frescos e selecionados para energizar o seu dia.',
                heroImageUrl: 'https://images.unsplash.com/photo-1601569927311-2856517445a4?q=80&w=1964&auto=format&fit=crop',
            }
        }
    } catch (error) {
        console.error("Error fetching homepage config:", error);
        // Return default values in case of error
        return {
            slogan: 'Descubra o sabor da natureza em cada gole. Nossos sumos são feitos com ingredientes frescos e selecionados para energizar o seu dia.',
            heroImageUrl: 'https://images.unsplash.com/photo-1601569927311-2856517445a4?q=80&w=1964&auto=format&fit=crop',
        }
    }
}

export default async function Home() {
  const config = await getHomePageConfig();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-grow container mx-auto px-4">
        <section className="grid md:grid-cols-2 gap-8 items-center py-12 md:py-24">
          <div className="flex flex-col items-start text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold font-headline text-primary leading-tight mb-4">
              Sumos Frescos, Vida Radiante.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
              {config.slogan}
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/menu">
                Ver o Menu <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="relative w-full aspect-square max-w-lg mx-auto">
             <Image 
                src={config.heroImageUrl || 'https://placehold.co/800x800.png'}
                alt="Imagem de sumos vibrantes" 
                fill
                className="object-cover rounded-full shadow-2xl"
                data-ai-hint="colorful juices"
                priority
              />
          </div>
        </section>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Drink It. Todos os direitos reservados.
      </footer>
    </div>
  );
}
