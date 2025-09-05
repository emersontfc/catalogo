
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlusCircle, ShoppingBag } from 'lucide-react';
import type { Product, Variation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartProvider';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    product.variations?.[0]
  );

  const hasVariations = product.variations && product.variations.length > 0;

  const handleAddToCart = () => {
    if (hasVariations) {
      setIsDialogOpen(true);
    } else {
      addToCart(product);
      toast({
        title: 'Adicionado ao carrinho!',
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
    }
  };

  const handleConfirmAddToCart = () => {
    if (selectedVariation) {
      addToCart(product, selectedVariation);
      toast({
        title: 'Adicionado ao carrinho!',
        description: `${product.name} (${selectedVariation.name}) foi adicionado ao seu carrinho.`,
      });
      setIsDialogOpen(false);
    }
  };

  const displayPrice = hasVariations
    ? `A partir de ${product.variations[0].price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}`
    : product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={`${product.category} juice`}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-headline mb-2">{product.name}</CardTitle>
          <p className="text-lg font-semibold text-primary">
            {displayPrice}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button onClick={handleAddToCart} className="w-full bg-accent hover:bg-accent/90 shadow-md hover:shadow-lg transition-shadow">
            {hasVariations ? <ShoppingBag className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {hasVariations ? 'Ver Opções' : 'Adicionar ao Carrinho'}
          </Button>
        </CardFooter>
      </Card>

      {hasVariations && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escolha uma opção para {product.name}</DialogTitle>
              <DialogDescription>Selecione o tamanho que deseja adicionar ao carrinho.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <RadioGroup
                defaultValue={selectedVariation?.name}
                onValueChange={(value) => {
                  setSelectedVariation(product.variations?.find(v => v.name === value))
                }}
              >
                {product.variations?.map((variation) => (
                  <Label
                    key={variation.name}
                    htmlFor={variation.name}
                    className="flex items-center justify-between p-4 border rounded-md cursor-pointer hover:bg-accent/50 [&:has([data-state=checked])]:bg-accent/80"
                  >
                    <span className="font-medium">{variation.name}</span>
                    <div className="flex items-center gap-4">
                       <span className="font-semibold text-primary">
                         {variation.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                       </span>
                       <RadioGroupItem value={variation.name} id={variation.name} />
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline">Cancelar</Button>
              <Button onClick={handleConfirmAddToCart} disabled={!selectedVariation}>
                Adicionar ao Carrinho
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProductCard;
