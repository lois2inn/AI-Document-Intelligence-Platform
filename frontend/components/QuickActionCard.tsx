import Link from "next/link";

type QuickActionCardProps = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export default function QuickActionCard({
  title,
  description,
  href,
  actionLabel,
}: QuickActionCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      <p className="mt-2 text-sm text-gray-600">{description}</p>

      <Link
        href={href}
        className="mt-4 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        {actionLabel}
      </Link>
    </div>
  );
}