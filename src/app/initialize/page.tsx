"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Play } from "lucide-react";
import { initializeUsers } from "@/scripts/init-firestore";

export default function InitializePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: any;
  }>({});

  const handleInitialize = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const result = await initializeUsers();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        message: "Une erreur inattendue s'est produite",
        error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Initialisation de la base de données</CardTitle>
          <CardDescription>
            Cette page permet d'initialiser la base de données Firestore avec les données de base.
            <strong className="text-red-500 block mt-2">
              Attention: À utiliser uniquement pour l'initialisation initiale.
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-700">
              Cette action va créer:
            </p>
            <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700">
              <li>Un utilisateur admin (AdminSystem)</li>
              <li>Un utilisateur standard (JeanUser)</li>
              <li>Un exemple de suggestion</li>
              <li>Un exemple de commentaire</li>
            </ul>
          </div>

          {result.success === true && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Succès</AlertTitle>
              <AlertDescription className="text-green-600">
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          {result.success === false && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Erreur</AlertTitle>
              <AlertDescription className="text-red-600">
                {result.message}
                {result.error && (
                  <pre className="mt-2 p-2 text-xs bg-red-100 rounded overflow-auto">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleInitialize} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Initialisation en cours...
              </span>
            ) : (
              <span className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                Initialiser la base de données
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 