
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// This function now fetches the configuration from Firestore.
// It's a server-side function, ensuring data is fresh on every load.
async function getHomePageConfig() {
    try {
        const configRef = doc(db, 'config', 'homepage');
        const docSnap = await getDoc(configRef);

        if (docSnap.exists()) {
            // If the document exists, return its data.
            const data = docSnap.data();
            return {
                slogan: data.slogan || 'O sabor da natureza em cada gole.', // Fallback slogan
                heroImageUrl: data.heroImageUrl || 'https://placehold.co/800x800.png', // Fallback image
            }
        } else {
            // Default values if the document doesn't exist at all
            return {
                slogan: 'Descubra o sabor da natureza em cada gole. Nossos sumos são feitos com ingredientes frescos e selecionados para energizar o seu dia.',
                heroImageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            }
        }
    } catch (error) {
        console.error("Error fetching homepage config:", error);
        // Return default values in case of any error during fetch
        return {
            slogan: 'Descubra o sabor da natureza em cada gole. Nossos sumos são feitos com ingredientes frescos e selecionados para energizar o seu dia.',
            heroImageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        }
    }
}

export default async function Home() {
  const config = await getHomePageConfig();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-grow container mx-auto px-4">
        <section className="grid md:grid-cols-2 gap-12 items-center py-12 md:py-24">
          <div className="flex flex-col items-start text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-primary leading-tight tracking-tight mb-4">
              Sumos Frescos, Vida Radiante.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
              {config.slogan}
            </p>
            <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow mx-auto md:mx-0">
              <Link href="/menu">
                Ver o Menu <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="relative w-full aspect-square max-w-lg mx-auto group">
             <Image 
                src={config.heroImageUrl || 'https://placehold.co/800x800.png'}
                alt="Imagem de uma rodela de laranja" 
                fill
                className="object-cover rounded-full shadow-2xl transition-transform duration-500 group-hover:scale-105"
                data-ai-hint="orange slice"
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
