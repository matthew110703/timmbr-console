import { Stack, Text, Center } from "@timmbr/ui";
import { PageHeader } from "@/components";
import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default function ProductsPage() {
  return (
    <Stack gap={4}>
      <PageHeader title={strings.title} description={strings.subtitle} />
      <Center className="h-64 border border-dashed border-grey-300 rounded-lg">
        <Text variant="body-2" foreground="muted">
          {strings.placeholder}
        </Text>
      </Center>
    </Stack>
  );
}
