
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Package, ChefHat, History, Phone, CheckCircle, List, PlusCircle, Trash2, Edit, X, Loader2, Settings, Eye, EyeOff, Home, Upload, Image as ImageIcon, CheckCheck } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import OrderCard from '@/components/OrderCard';
import ProductForm from '@/components/ProductForm';
import { type Order, type Product } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Settings state
  const [contactPhone, setContactPhone] = useState('');
  const [slogan, setSlogan] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const sessionPassword = sessionStorage.getItem('admin-password');
    if (sessionPassword !== 'Menterara2025') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Bom dia';
      if (hour < 18) return 'Boa tarde';
      return 'Boa noite';
    };
    setGreeting(getGreeting());

    // Fetch config from Firestore
    const contactConfigRef = doc(db, 'config', 'contact');
    const unsubscribeContact = onSnapshot(contactConfigRef, (doc) => {
        if (doc.exists()) {
            setContactPhone(doc.data().businessPhoneNumber || '');
        }
    });

    const homepageConfigRef = doc(db, 'config', 'homepage');
    const unsubscribeHomepage = onSnapshot(homepageConfigRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setSlogan(data.slogan || '');
            setHeroImageUrl(data.heroImageUrl || null);
        }
    });

    // Fetch products from Firestore
    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(productsData);
    });

    // Fetch orders from Firestore
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(), // Convert Firestore Timestamp to Date
            } as Order;
        });
        setOrders(ordersData);
    });


    return () => {
        unsubscribeContact();
        unsubscribeProducts();
        unsubscribeOrders();
        unsubscribeHomepage();
    };
  }, [isAuthenticated]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactPhone(e.target.value);
  };

  const saveContactPhone = async () => {
    const configRef = doc(db, 'config', 'contact');
    try {
        await setDoc(configRef, { businessPhoneNumber: contactPhone }, { merge: true });
        toast({
            title: 'Sucesso!',
            description: 'O número de contato foi atualizado.',
            action: <CheckCircle className="text-green-500" />,
        })
    } catch (error) {
        console.error("Error saving contact phone: ", error);
        toast({ title: 'Erro!', description: 'Não foi possível salvar o número de contato.', variant: 'destructive' });
    }
  };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: 'Erro!',
                    description: 'A imagem é muito grande. O tamanho máximo é 2MB.',
                    variant: 'destructive',
                });
                return;
            }

            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                // For now, we'll store the data URL.
                // In a real app, you'd upload this to a service like Firebase Storage
                // and get a public URL back.
                setHeroImageUrl(dataUrl);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };


  const saveHomepageConfig = async () => {
    const configRef = doc(db, 'config', 'homepage');
    try {
        await setDoc(configRef, { 
            slogan: slogan,
            heroImageUrl: heroImageUrl 
        }, { merge: true });
        toast({
            title: 'Sucesso!',
            description: 'As configurações da página inicial foram atualizadas.',
            action: <CheckCircle className="text-green-500" />,
        })
    } catch (error) {
        console.error("Error saving homepage config: ", error);
        toast({ title: 'Erro!', description: 'Não foi possível salvar as configurações.', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const orderRef = doc(db, 'orders', orderId);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        toast({ title: 'Erro!', description: 'Pedido não encontrado.', variant: 'destructive' });
        return;
    }

    try {
        await updateDoc(orderRef, { status: newStatus });
        
        let message = '';
        if (newStatus === 'preparing') {
            message = `Olá *${order.customerName}*! Seu pedido *#${order.id.slice(0, 6)}* da Drink It já está em preparação. Em breve estará pronto!`;
        } else if (newStatus === 'ready') {
            message = `Olá *${order.customerName}*! Seu pedido *#${order.id.slice(0, 6)}* da Drink It está pronto!\n\n` +
                      `*Por favor, efetue o pagamento no levantamento* via M-Pesa, e-Mola ou em numerário para um dos seguintes contactos:\n\n` +
                      `*856727539* (Gerson Joaquim Filipe Charles)\n` +
                      `*869059082* (Gerson Joaquim Filipe Charles)\n\n` +
                      `Agradecemos a sua preferência!`;
        }

        if (message) {
            let customerPhone = order.phone.replace(/\s+/g, '');
            if (!customerPhone.startsWith('258')) {
                customerPhone = '258' + customerPhone;
            }
            const whatsappLink = `https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappLink, '_blank');
        }

        toast({ 
            title: 'Status do Pedido Atualizado!',
            description: 'A notificação para o cliente está pronta para ser enviada.',
            action: <CheckCheck className="text-blue-500" />
        });

    } catch (error) {
        console.error("Error updating order status: ", error);
        toast({ title: 'Erro!', description: 'Não foi possível atualizar o status do pedido.', variant: 'destructive' });
    }
  };
  
    const handleDeleteOrder = async (orderId: string) => {
        const orderRef = doc(db, 'orders', orderId);
        try {
            await deleteDoc(orderRef);
            toast({
                title: 'Pedido Removido!',
                description: 'O pedido foi removido com sucesso.',
            });
        } catch (error) {
            console.error("Error deleting order: ", error);
            toast({ title: 'Erro!', description: 'Não foi possível remover o pedido.', variant: 'destructive' });
        }
    };

  const getFilteredOrders = (status: Order['status']) => {
    return orders
      .filter((order) => order.status === status)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
        await deleteDoc(doc(db, 'products', productId));
        toast({
            title: 'Produto Removido!',
            description: 'O produto foi removido com sucesso.',
        });
    } catch (error) {
        console.error("Error deleting product: ", error);
        toast({ title: 'Erro!', description: 'Não foi possível remover o produto.', variant: 'destructive' });
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    const productRef = doc(db, 'products', product.id as string);
    try {
      await updateDoc(productRef, { isAvailable: !product.isAvailable });
      toast({
        title: 'Status de Disponibilidade Atualizado!',
        description: `${product.name} agora está ${!product.isAvailable ? 'disponível' : 'indisponível'}.`,
      });
    } catch (error) {
      console.error("Error toggling availability: ", error);
      toast({ title: 'Erro!', description: 'Não foi possível atualizar a disponibilidade.', variant: 'destructive' });
    }
  };


  const handleFormSubmit = async (productData: Omit<Product, 'id'>) => {
    try {
        if(editingProduct && editingProduct.id) {
            // Update existing product
            const productRef = doc(db, 'products', editingProduct.id);
            await updateDoc(productRef, productData);
            toast({ title: 'Sucesso!', description: 'Produto atualizado.' });
        } else {
            // Add new product
            await addDoc(collection(db, 'products'), productData);
            toast({ title: 'Sucesso!', description: 'Novo produto adicionado.' });
        }
        setIsFormOpen(false);
        setEditingProduct(null);
    } catch (error) {
        console.error("Error saving product: ", error);
        toast({ title: 'Erro!', description: 'Não foi possível salvar o produto.', variant: 'destructive' });
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">
          Painel do Administrador
        </h1>
        <p className="text-md md:text-lg text-muted-foreground">
          {greeting}, Chefe Gerson! Gerencie os pedidos e produtos da sua loja.
        </p>
      </div>
      
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 sm:w-fit mx-auto mb-8 h-auto">
          <TabsTrigger value="orders" className="py-2 text-sm md:text-base">
            <History className="mr-2 h-4 w-4" /> Pedidos
          </TabsTrigger>
          <TabsTrigger value="products" className="py-2 text-sm md:text-base">
            <Package className="mr-2 h-4 w-4" /> Produtos
          </TabsTrigger>
          <TabsTrigger value="settings" className="py-2 text-sm md:text-base">
            <Settings className="mr-2 h-4 w-4" /> Configurações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:w-fit mx-auto mb-8 h-auto">
              <TabsTrigger value="pending" className="py-2 text-sm md:text-base">
                <History className="mr-2 h-4 w-4" /> Pendentes
              </TabsTrigger>
              <TabsTrigger value="preparing" className="py-2 text-sm md:text-base">
                <ChefHat className="mr-2 h-4 w-4" /> Em Preparo
              </TabsTrigger>
              <TabsTrigger value="ready" className="py-2 text-sm md:text-base">
                <Package className="mr-2 h-4 w-4" /> Prontos
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
                <TabsContent key="pending" value="pending">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredOrders('pending').map((order) => (
                            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent key="preparing" value="preparing">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredOrders('preparing').map((order) => (
                            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent key="ready" value="ready">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredOrders('ready').map((order) => (
                            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDeleteOrder} />
                        ))}
                    </div>
                </TabsContent>
            </AnimatePresence>
          </Tabs>
        </TabsContent>

        <TabsContent value="products">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl md:text-2xl">Gerenciar Produtos</CardTitle>
                            <CardDescription>Adicione, edite ou remova os sumos do seu catálogo.</CardDescription>
                        </div>
                        <Button onClick={handleAddNewProduct} className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Produto
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Imagem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Disponibilidade</TableHead>
                            <TableHead className="text-right">Preço</TableHead>
                            <TableHead className="w-[120px] text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map(product => (
                              <TableRow key={product.id}>
                                <TableCell>
                                    <Image src={product.imageUrl} alt={product.name} width={50} height={50} className="rounded-md object-cover" />
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                      <Switch
                                          id={`available-switch-${product.id}`}
                                          checked={product.isAvailable}
                                          onCheckedChange={() => handleToggleAvailability(product)}
                                          aria-label="Disponibilidade do produto"
                                      />
                                      <label htmlFor={`available-switch-${product.id}`} className="text-sm">
                                          {product.isAvailable ? (
                                              <Badge variant="outline" className="border-green-500 text-green-700">
                                                  <Eye className="mr-1 h-3 w-3" /> Disponível
                                              </Badge>
                                          ) : (
                                              <Badge variant="secondary">
                                                  <EyeOff className="mr-1 h-3 w-3" /> Indisponível
                                              </Badge>
                                          )}
                                      </label>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</TableCell>
                                <TableCell className="flex justify-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. Isto irá remover permanentemente o produto.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id as string)} className="bg-destructive hover:bg-destructive/90">
                                                    Sim, remover
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                        <Home />
                        Página Inicial
                    </CardTitle>
                    <CardDescription>
                      Personalize o conteúdo da página de boas-vindas, como o slogan e a imagem principal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="slogan" className="text-sm font-medium">Slogan</label>
                        <Textarea
                            id="slogan"
                            placeholder="Descreva sua loja em uma frase cativante..."
                            value={slogan}
                            onChange={(e) => setSlogan(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                     <div className="space-y-2">
                         <label htmlFor="slogan" className="text-sm font-medium">Imagem Principal</label>
                         <div className="w-full h-64 border-2 border-dashed rounded-md flex items-center justify-center relative">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Loader2 className="animate-spin h-8 w-8" />
                                    <p>Processando...</p>
                                </div>
                            ) : heroImageUrl ? (
                              <>
                                <Image src={heroImageUrl} alt="Preview" layout="fill" objectFit="contain" className="rounded-md p-2" />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70" onClick={() => {
                                    setHeroImageUrl(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}>
                                   <X className="text-white" />
                                </Button>
                              </>
                            ) : (
                              <div className="text-center text-muted-foreground">
                                <ImageIcon className="mx-auto h-12 w-12" />
                                <p>Arraste ou clique para carregar</p>
                                <p className="text-xs">Tamanho máximo: 2MB</p>
                              </div>
                            )}
                             <input
                                type="file"
                                ref={fileInputRef}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                              />
                          </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={saveHomepageConfig} disabled={isUploading}>
                        {isUploading ? <Loader2 className="animate-spin mr-2"/> : null}
                        Salvar Alterações
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                        <Phone />
                        Configurações de Contato
                    </CardTitle>
                    <CardDescription>
                      Altere o número de telefone que receberá as mensagens dos pedidos no WhatsApp.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Input
                      type="tel"
                      placeholder="Número de WhatsApp"
                      value={contactPhone}
                      onChange={handlePhoneChange}
                      className="max-w-xs text-base"
                    />
                    <Button onClick={saveContactPhone} className="w-full sm:w-auto">Salvar Contato</Button>
                </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md relative max-h-full overflow-y-auto">
                <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsFormOpen(false)}>
                    <X />
                </Button>
                <ProductForm 
                    onSubmit={handleFormSubmit}
                    initialData={editingProduct}
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
