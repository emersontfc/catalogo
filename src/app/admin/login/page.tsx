
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const AdminLoginPage = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'Menterara2025') {
            sessionStorage.setItem('admin-password', password);
            toast({
                title: 'Sucesso!',
                description: 'Login efetuado com sucesso.',
            });
            router.push('/admin');
        } else {
            setError('Senha incorreta. Tente novamente.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleLogin}>
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit mb-4">
                            <Lock className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Acesso Restrito</CardTitle>
                        <CardDescription>
                            Por favor, insira a senha para acessar o painel administrativo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AdminLoginPage;

    