
'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Query only for available products
    const q = query(
        collection(db, 'products'), 
        where('isAvailable', '==', true),
        orderBy('name')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
        console.error("Failed to fetch products from Firestore", error);
        // Optionally handle the error, e.g., show a message to the user
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                     <Skeleton className="h-10 w-full mt-2" />
                </div>
            ))}
        </div>
    )
  }

  if (products.length === 0) {
      return (
          <div className="text-center col-span-full py-12">
              <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
