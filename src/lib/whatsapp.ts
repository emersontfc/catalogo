
import type { CartItem } from './types';

interface CustomerDetails {
  fullName: string;
  phone: string;
  deliveryAddress: string;
}

const getBaseUrl = () => {
    // Prioritize the production domain provided by the user.
    const productionUrl = 'https://drinkit1.vercel.app';
    if (productionUrl) {
        return productionUrl;
    }

    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
    }
    // Fallback for local development
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'http://localhost:9002'; // Default for server-side if no env var
};


export const generateWhatsAppLink = (
  customer: CustomerDetails,
  cartItems: CartItem[],
  totalPrice: number,
  businessPhoneNumber: string,
  orderId: string
): string => {
  const now = new Date();
  const orderTime = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  
  const adminLink = `${getBaseUrl()}/admin`;

  let message = `*Olá, Drink It! Gostaria de fazer um novo pedido.*\n\n`;
  message += `*ID do Pedido:* ${orderId}\n`
  message += `*Data e Hora:* ${orderTime}\n\n`;
  message += `*Detalhes do Cliente:*\n`;
  message += `*Nome:* ${customer.fullName}\n`;
  message += `*Telefone:* ${customer.phone}\n`;
  message += `*Endereço de Entrega:* ${customer.deliveryAddress}\n\n`;
  message += `*Itens do Pedido:*\n`;

  cartItems.forEach(item => {
    const variationText = item.variation ? ` (${item.variation.name})` : '';
    message += `- ${item.quantity}x ${item.name}${variationText} (${item.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })})\n`;
  });

  message += `\n*Total:* *${totalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}*\n\n`;
  message += `-------\n`;
  message += `*Para o Administrador:*\n`;
  message += `Para gerenciar este pedido, acesse: ${adminLink}\n`;
  message += `-------\n\n`;
  message += `*Aguardo a confirmação do meu pedido. Obrigado!*`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${businessPhoneNumber}?text=${encodedMessage}`;
};
