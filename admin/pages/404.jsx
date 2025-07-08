// admin/pages/404.jsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin"); // admin 메인으로 이동
  }, [router]);
  return null;
}