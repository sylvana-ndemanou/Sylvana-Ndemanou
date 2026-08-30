import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="font-heading mt-3 text-4xl">Ce jeu n’existe pas.</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Peut-être un ancien lien, peut-être un dashboard trop filtré. Retour aux manches.
      </p>
      <Button nativeButton={false} className="mt-8" render={<Link href="/" />}>
        Tous les jeux
      </Button>
    </div>
  );
}
