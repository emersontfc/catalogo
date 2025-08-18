import ProductList from "@/components/ProductList";
import Image from "next/image";

export default function MenuPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold font-headline text-primary">
                    Nosso Menu
                </h1>
                <p className="text-lg mt-2 text-muted-foreground">
                    Sumos frescos e deliciosos, feitos na hora para você.
                </p>
            </div>
            <ProductList />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Drink It. Todos os direitos reservados.
      </footer>
    </div>
  );
}
