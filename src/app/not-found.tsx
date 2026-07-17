import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl italic tracking-tight text-ink md:text-5xl">
        Nothing logged here
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        This entry doesn&apos;t exist — it may have been renamed or never
        committed.
      </p>
      <div className="mt-8">
        <Button href="/">← Back home</Button>
      </div>
    </Container>
  );
}
