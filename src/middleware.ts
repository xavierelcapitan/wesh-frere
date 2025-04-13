import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Tableau des chemins publics qui ne nécessitent pas d'authentification
const publicPaths = ['/login', '/_next', '/api/auth', '/images']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Vérifier si le chemin est public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Récupérer le cookie de session
  const authCookie = request.cookies.get('session')
  
  // Si le chemin est public, permettre l'accès
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Si l'utilisateur tente d'accéder à une route protégée sans authentification
  if (!authCookie && !isPublicPath) {
    // Rediriger vers la page de login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  // Pour toutes les autres routes, continuer
  return NextResponse.next()
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Faire correspondre toutes les routes sauf:
     * 1. /api/auth (NextAuth.js)
     * 2. /_next (ressources Next.js)
     * 3. /images (Images locales)
     * 4. /login (Page de connexion)
     */
    '/((?!api/auth|_next|images|login).*)',
  ],
}
