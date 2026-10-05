import { Stack, Heading, Text, Center } from "@timmbr/ui";
import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default function BrandsPage() {
  return (
    <Stack gap={4}>
      <Stack gap={1}>
        <Heading
          level={1}
          className="text-2xl font-bold tracking-tight text-grey-900 font-sans"
        >
          {strings.title}
        </Heading>
        <Text variant="body-2" foreground="muted">
          {strings.subtitle}
        </Text>
      </Stack>
      <Center className="h-64 border border-dashed border-grey-300 rounded-lg">
        <Text variant="body-2" foreground="muted">
          {strings.placeholder}
        </Text>
      </Center>
    </Stack>
  );
}
