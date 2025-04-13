"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createOrUpdateUser } from "@/services/users";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Timestamp } from "firebase/firestore";

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Schéma de validation pour l'inscription
const signupSchema = z.object({
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  pseudo: z.string().min(2, "Le pseudo doit contenir au moins 2 caractères"),
  ville: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  age: z.coerce.number().min(13, "Vous devez avoir au moins 13 ans").max(120, "Âge invalide"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(6, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [error, setError] = useState<string>("");
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);
  const [loadingSignup, setLoadingSignup] = useState<boolean>(false);

  // Formulaire de connexion
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Formulaire d'inscription
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      prenom: "",
      pseudo: "",
      ville: "",
      age: 18,
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Soumission du formulaire de connexion
  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setLoadingLogin(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setError(
        error.code === "auth/invalid-credential"
          ? "Email ou mot de passe incorrect"
          : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoadingLogin(false);
    }
  }

  // Soumission du formulaire d'inscription
  async function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    setLoadingSignup(true);
    setError("");
    
    try {
      // 1. Créer l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      
      // 2. Mettre à jour le profil utilisateur avec le pseudo
      await updateProfile(userCredential.user, {
        displayName: values.pseudo
      });
      
      // 3. Enregistrer les informations complètes dans Firestore
      await createOrUpdateUser({
        id: userCredential.user.uid,
        pseudo: values.pseudo,
        prenom: values.prenom,
        ville: values.ville,
        email: values.email,
        age: values.age,
        role: "user",
        status: "active",
        createdAt: Timestamp.now()
      });
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
      
      // Passer à l'onglet de connexion
      setActiveTab("login");
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé par un autre compte");
      } else {
        setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoadingSignup(false);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Version Mobile</h1>
        <p className="mb-6 text-gray-600">
          Intégrez ces écrans dans votre application mobile pour permettre l'authentification des utilisateurs.
        </p>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl text-center">Authentification Mobile</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous ou inscrivez-vous pour accéder à l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemple.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && activeTab === "login" && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={loadingLogin}>
                      {loadingLogin ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="pseudo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pseudo</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre pseudo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="ville"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre ville" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âge</FormLabel>
                          <FormControl>
                            <Input type="number" min="13" placeholder="Votre âge" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@exemple.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && activeTab === "signup" && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={loadingSignup}>
                      {loadingSignup ? "Inscription..." : "S'inscrire"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Comment intégrer</h3>
          <p className="text-sm text-blue-700">
            Utilisez le code source de cette page comme référence pour implémenter 
            l'authentification dans votre application mobile. Les formulaires incluent 
            déjà la validation et la gestion des erreurs.
          </p>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
} 