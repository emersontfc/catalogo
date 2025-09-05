
'use client';

import React from 'react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import Image from 'next/image';

import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { CheckoutDialog } from './CheckoutDialog';
import { Badge } from './ui/badge';

interface CartProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const Cart = ({ isOpen, onOpenChange }: CartProps) => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  const handleCheckout = () => {
    onOpenChange(false);
    setIsCheckoutOpen(true);
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-2xl font-headline">
              <ShoppingCart className="h-6 w-6" />
              Seu Carrinho
            </SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          {cartItems.length > 0 ? (
            <>
              <ScrollArea className="flex-grow pr-4">
                <div className="flex flex-col gap-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                           data-ai-hint={`${item.category} juice`}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.variation && (
                            <Badge variant="secondary" className="mb-1">{item.variation.name}</Badge>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id as string, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id as string, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id as string)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-4" />
              <SheetFooter className="mt-auto">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      {totalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </span>
                  </div>
                  <Button onClick={handleCheckout} size="lg" className="w-full bg-primary hover:bg-primary/90">
                    Finalizar Pedido
                  </Button>
                  <Button variant="outline" onClick={clearCart}>
                    <Trash2 className="mr-2 h-4 w-4" /> Esvaziar Carrinho
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : (
            <div className="flex flex-grow flex-col items-center justify-center gap-4 text-center">
              <ShoppingCart className="h-20 w-20 text-muted-foreground/50" strokeWidth={1} />
              <h3 className="text-xl font-semibold">Seu carrinho está vazio</h3>
              <p className="text-muted-foreground">Adicione alguns sumos deliciosos!</p>
              <SheetClose asChild>
                <Button variant="outline">Continuar comprando</Button>
              </SheetClose>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <CheckoutDialog isOpen={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  );
};

export default Cart;
