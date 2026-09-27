import { Center, Container } from "@timmbr/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Center asChild className="min-h-screen p-4 bg-grey-50">
      <main>
        <Container maxWidth="sm" padded={false}>
          {children}
        </Container>
      </main>
    </Center>
  );
}
