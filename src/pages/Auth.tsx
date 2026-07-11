import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagOk, setDiagOk] = useState<boolean | null>(null);
  const [diagMessage, setDiagMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const runConnectivityTest = async () => {
    setDiagLoading(true);
    setDiagOk(null);
    setDiagMessage(null);

    try {
      // Faz uma chamada real ao GoTrue para detectar falhas de rede/CORS.
      const { error } = await supabase.auth.signInWithPassword({
        email: "diagnostico@exemplo.com",
        password: "diagnostico-invalido",
      });

      // Se recebemos resposta do Supabase (mesmo erro), a conectividade está OK.
      setDiagOk(true);
      setDiagMessage(
        error
          ? `Conexão OK com Supabase (erro esperado: ${error.message}).`
          : "Conexão OK com Supabase."
      );
    } catch (error: any) {
      const msg = typeof error?.message === "string" ? error.message : "Failed to fetch";
      setDiagOk(false);
      setDiagMessage(
        `Falha ao conectar no Supabase (${msg}). Isso normalmente é CORS/bloqueio de rede. Em Supabase > Settings > API, adicione em CORS Allowed Origins apenas o domínio (sem /**): ${window.location.origin}`
      );
    } finally {
      setDiagLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Erro de login:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
      }
    } catch (error: any) {
      console.error("Erro de cadastro:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sistema de Produção</CardTitle>
          <CardDescription>Entre na sua conta ou crie uma nova</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pb-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={runConnectivityTest}
              disabled={diagLoading}
            >
              {diagLoading ? "Testando conexão..." : "Testar conexão com Supabase"}
            </Button>

            {diagMessage ? (
              <Alert variant={diagOk ? "default" : "destructive"}>
                <AlertTitle>
                  {diagOk ? "Conexão com Supabase" : "Falha de conexão com Supabase"}
                </AlertTitle>
                <AlertDescription>{diagMessage}</AlertDescription>
              </Alert>
            ) : null}
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">E-mail</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Senha</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}