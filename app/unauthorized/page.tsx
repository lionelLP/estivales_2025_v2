export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Accès non autorisé
        </h1>
        <p className="text-gray-600 mb-4">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
