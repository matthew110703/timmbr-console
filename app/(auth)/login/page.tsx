import { strings } from "./strings";

export const metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg border border-neutral-200 shadow-sm">
      <h1 className="text-xl font-semibold mb-2">{strings.title}</h1>
      <p className="text-sm text-neutral-500 mb-6">{strings.subtitle}</p>
      {/* Design placeholder — auth UI components will be implemented here */}
      <div className="py-8 text-center text-sm text-neutral-400 border border-dashed border-neutral-200 rounded">
        {strings.placeholder}
      </div>
    </div>
  );
}
