import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "My Favorites",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
