
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { CheckCircle, PartyPopper } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartProvider';
import { useToast } from '@/hooks/use-toast';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Textarea } from '@/components/ui/textarea';

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório.'),
  phone: z.string().min(9, 'Telefone inválido.'),
  deliveryAddress: z.string().min(10, 'Endereço de entrega é obrigatório.'),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 mr-2"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );

export function CheckoutDialog({ isOpen, onOpenChange }: CheckoutDialogProps) {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState('');

  useEffect(() => {
    const fetchContactPhone = async () => {
      const configRef = doc(db, 'config', 'contact');
      const docSnap = await getDoc(configRef);
      if (docSnap.exists() && docSnap.data().businessPhoneNumber) {
        let phone = docSnap.data().businessPhoneNumber.replace(/\s+/g, '');
        if (!phone.startsWith('258')) {
            phone = '258' + phone;
        }
        setBusinessPhoneNumber(phone);
      } else {
        setBusinessPhoneNumber('258856727539'); // Fallback default
      }
    };
    
    if (isOpen) {
      fetchContactPhone();
    }
  }, [isOpen]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      deliveryAddress: '',
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!businessPhoneNumber) {
        toast({
            title: 'Erro de Configuração',
            description: 'O número de telefone da loja não está configurado. Contacte o suporte.',
            variant: 'destructive',
        });
        return;
    }
    
    try {
        const orderId = `pedido-${Math.random().toString(36).substring(2, 8)}`;
        
        let customerPhone = data.phone.replace(/\s+/g, '');
        if (!customerPhone.startsWith('258')) {
            customerPhone = '258' + customerPhone;
        }

        // Save order to Firestore
        await addDoc(collection(db, 'orders'), {
            customerName: data.fullName,
            phone: customerPhone, // Save standardized phone
            deliveryAddress: data.deliveryAddress,
            items: cartItems.map((item) => ({
                id: (item.id as string).split('_')[0], // Extract original product ID
                quantity: item.quantity, 
                name: item.name, 
                price: item.price, 
                variationName: item.variation?.name 
            })),
            total: totalPrice,
            status: 'pending',
            createdAt: serverTimestamp(),
            orderId: orderId, // The temporary human-readable ID
        });
        
        // Generate WhatsApp link
        const whatsappLink = generateWhatsAppLink({ ...data, phone: customerPhone }, cartItems, totalPrice, businessPhoneNumber, orderId);

        // Open WhatsApp link in a new tab
        window.open(whatsappLink, '_blank');

        toast({
          title: 'Pedido Enviado!',
          description: 'Seu pedido foi formatado. Conclua o envio no WhatsApp.',
        });

        setIsSubmitted(true);
        
        // Reset cart after a short delay to show success animation
        setTimeout(() => {
            clearCart();
        }, 500)
    } catch(error) {
        console.error("Error creating order: ", error);
        toast({
            title: 'Erro no Pedido!',
            description: 'Não foi possível registrar seu pedido. Tente novamente.',
            variant: 'destructive',
        });
    }
  };
  
  const handleClose = (open: boolean) => {
    if(!open) {
        // Reset state when dialog is closed
        setTimeout(() => {
            setIsSubmitted(false);
            form.reset();
        }, 500);
    }
    onOpenChange(open);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {isSubmitted ? (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-8"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                >
                    <PartyPopper className="h-24 w-24 text-primary" />
                </motion.div>
                <DialogTitle className="font-headline text-2xl mt-6">Sucesso!</DialogTitle>
                <DialogDescription className="mt-2">
                    Seu pedido foi enviado. Use o WhatsApp para confirmar e acompanhar.
                </DialogDescription>
                <Button onClick={() => handleClose(false)} className="mt-8">
                    <CheckCircle className="mr-2 h-4 w-4" /> Fechar
                </Button>
            </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Informações de Entrega</DialogTitle>
              <DialogDescription>
                Preencha seus dados para finalizar o pedido. Ele será enviado via WhatsApp.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (Ex: 84, 85, 86, 87)</FormLabel>
                      <FormControl>
                        <Input placeholder="841234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço de Entrega</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Rua, Bairro, Ponto de Referência..." 
                          className="resize-none"
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={!businessPhoneNumber}>
                    <WhatsAppIcon /> Enviar pedido via WhatsApp
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
