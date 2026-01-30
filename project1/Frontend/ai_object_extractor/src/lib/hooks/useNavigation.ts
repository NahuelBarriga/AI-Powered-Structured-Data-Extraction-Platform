import { useRouter } from "next/navigation";

export const useNavigation = () => {
  const router = useRouter();

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
  };
};
