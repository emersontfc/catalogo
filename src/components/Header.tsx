'use client';

import React from 'react';
import { ShoppingCart, UserCog } from 'lucide-react';
import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import Cart from '@/components/Cart';
import Link from 'next/link';

const Header = () => {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            Drink It
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Painel do Administrador"
              >
                <UserCog className="h-6 w-6" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Ver carrinho de compras com ${totalItems} itens`}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
      <Cart isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
};

export default Header;
