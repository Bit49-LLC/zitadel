"use client";

import { useRouter } from "next/navigation";
import { Translated } from "./translated";

// Revolve design: secondary navigation is a subtle text link, not a bordered button
export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      type="button"
      className="hover:text-primary-light-500 dark:hover:text-primary-dark-500 text-sm text-gray-500 transition-all dark:text-gray-400"
    >
      <Translated i18nKey="back" namespace="common" />
    </button>
  );
}
