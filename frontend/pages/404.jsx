import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/"); // 메인페이지로 이동
  }, [router]);
  return null; // 아무것도 렌더링하지 않음
}