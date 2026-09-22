import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{strings.title}</h1>
      <p className="text-sm text-neutral-500">{strings.subtitle}</p>
      <div className="h-64 border border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-sm text-neutral-400">
        {strings.placeholder}
      </div>
    </div>
  );
}
