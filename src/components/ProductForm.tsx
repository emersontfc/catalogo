
'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type Product, type Variation } from '@/lib/types';
import { Upload, Image as ImageIcon, X, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const variationSchema = z.object({
  name: z.string().min(1, 'O nome da variação é obrigatório.'),
  price: z.coerce.number().min(0, 'O preço deve ser um número positivo.'),
});

const formSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  price: z.coerce.number().min(0, 'O preço base é obrigatório.'),
  category: z.string().min(3, 'A categoria é obrigatória.'),
  imageUrl: z.string().url('A imagem do produto é obrigatória.'),
  isAvailable: z.boolean().default(true),
  variations: z.array(variationSchema).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: ProductFormValues) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? { ...initialData, variations: initialData.variations || [] } : {
      name: '',
      price: 0,
      category: '',
      imageUrl: '',
      isAvailable: true,
      variations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variations',
  });
  
  React.useEffect(() => {
    if (initialData) {
        form.reset({ ...initialData, variations: initialData.variations || [] });
        setImagePreview(initialData.imageUrl);
    }
  }, [initialData, form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Erro!',
          description: 'A imagem é muito grande. O tamanho máximo é 1MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
          setImagePreview(dataUrl);
          form.setValue('imageUrl', dataUrl, { shouldValidate: true });
        } catch (error) {
            console.error("Image processing failed", error);
            form.setError('imageUrl', { type: 'manual', message: 'Falha ao processar a imagem.' });
            setImagePreview(null);
        } finally {
            setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Produto' : 'Adicionar Novo Produto'}</CardTitle>
        <CardDescription>
          Preencha os detalhes do sumo abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Produto</FormLabel>
                  <FormControl>
                    <div className="w-full">
                      <div className="w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center relative">
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin h-8 w-8" />
                                <p>Processando...</p>
                            </div>
                        ) : imagePreview ? (
                          <>
                            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" />
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70" onClick={() => {
                                setImagePreview(null);
                                form.setValue('imageUrl', '');
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}>
                               <X className="text-white" />
                            </Button>
                          </>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="mx-auto h-12 w-12" />
                            <p>Arraste ou clique para carregar</p>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Sumo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sumo de Laranja com Gengibre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Base (MZN)</FormLabel>
                   <FormDescription>Usado se não houver variações. Se houver variações, este preço é ignorado.</FormDescription>
                  <FormControl>
                    <Input type="number" step="0.50" placeholder="Ex: 150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div>
              <FormLabel>Variações de Preço</FormLabel>
              <FormDescription>Adicione tamanhos diferentes como "Pote Médio" ou "Pote Grande".</FormDescription>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                   <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                     <FormField
                       control={form.control}
                       name={`variations.${index}.name`}
                       render={({ field }) => (
                         <FormItem className="flex-grow">
                           <FormLabel className="text-xs">Nome da Variação</FormLabel>
                           <FormControl>
                             <Input placeholder="Pote Médio" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name={`variations.${index}.price`}
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-xs">Preço (MZN)</FormLabel>
                           <FormControl>
                             <Input type="number" step="0.50" placeholder="250" {...field} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', price: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Variação
              </Button>
            </div>

            <Separator />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cítricos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Disponível no menu</FormLabel>
                    <FormDescription>
                      Se desativado, este produto não será exibido aos clientes.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isUploading || form.formState.isSubmitting}>
              {isUploading || form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              {initialData ? 'Salvar Alterações' : 'Adicionar Produto'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
