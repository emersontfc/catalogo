
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, CookingPot, PackageCheck, Trash2 } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
  onDelete: (orderId: string) => void;
}

const statusConfig: Record<Order['status'], { label: string; icon: JSX.Element; color: string; actions: Array<Order['status']> }> = {
  pending: {
    label: 'Pendente',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-yellow-500',
    actions: ['preparing', 'ready'],
  },
  preparing: {
    label: 'Em Preparo',
    icon: <CookingPot className="h-5 w-5" />,
    color: 'bg-blue-500',
    actions: ['ready'],
  },
  ready: {
    label: 'Pronto',
    icon: <PackageCheck className="h-5 w-5" />,
    color: 'bg-green-500',
    actions: [],
  },
};

const actionConfig: Record<string, { label: string; icon: JSX.Element; variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | null | undefined; }> = {
    preparing: {
        label: 'Iniciar Preparo',
        icon: <CookingPot className="mr-2 h-4 w-4" />,
        variant: 'default',
    },
    ready: {
        label: 'Marcar como Pronto',
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
        variant: 'secondary',
    }
}

const OrderCard = ({ order, onStatusChange, onDelete }: OrderCardProps) => {
  const currentStatus = statusConfig[order.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Card className="overflow-hidden flex flex-col h-full">
        <CardHeader className="flex flex-row items-start bg-muted/50 px-6 py-4">
          <div className="flex-grow">
            <CardTitle className="text-xl font-headline mb-1">Pedido {order.orderId}</CardTitle>
            <CardDescription>{order.customerName}</CardDescription>
            <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
          </div>
          <Badge variant="outline" className={`flex items-center gap-2 text-white text-base py-1 px-3 rounded-full border-none ${currentStatus.color}`}>
            {currentStatus.icon}
            <span>{currentStatus.label}</span>
          </Badge>
        </CardHeader>
        <CardContent className="p-6 text-sm flex-grow">
          <p className="mb-3 font-semibold">Itens:</p>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={`${item.id}-${index}`} className="flex justify-between">
                <span>{item.quantity}x {item.name} {item.variationName ? `(${item.variationName})` : ''}</span>
                <span className="font-mono">{item.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 flex gap-2 justify-between items-center mt-auto">
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-5 w-5" />
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isto irá remover permanentemente o pedido.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(order.id)} className="bg-destructive hover:bg-destructive/90">
                          Sim, remover
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2 justify-end">
            {currentStatus.actions.map((action) => {
              const config = actionConfig[action];
              if (!config) return null;
              return (
                  <Button
                    key={action}
                    variant={config.variant}
                    onClick={() => onStatusChange(order.id, action)}
                  >
                    {config.icon}
                    {config.label}
                  </Button>
              )
            })}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OrderCard;
