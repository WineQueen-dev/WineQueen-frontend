import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import styles from "../styles/Wine.module.css";
import { subscribeWS } from "../lib/ws";
import { getWebSocketUrl, getHttpUrl } from "../constants/constants";

const CloseWine = () => {
  const navigate = useNavigate();
  const firedRef = useRef(false);

  const onClick = useCallback(() => {
    navigate("/main");
  }, [navigate]);

  const fireOnce = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onClick();
  }, [onClick]);

  // ✅ WS에서 'F' 또는 process_status: finished 수신 시 즉시 이동
  useEffect(() => {
    const off = subscribeWS(getWebSocketUrl("/ws"), (e) => {
      let data: any = e.data;

      if (typeof data === "string") {
        const t = data.trim?.();

        // 하트비트 제외
        if (t === "ping" || t === "pong") return;

        // 시리얼에서 바로 'F' 혹은 호환용 '3'
        if (t === "F" || t === "3") {
          fireOnce();
          return;
        }

        try {
          data = JSON.parse(t);
        } catch {
          return;
        }
      }

      // 버튼 이벤트(1=seal, 3=호환)
      if (data?.type === "button" && (Number(data.value) === 1 || Number(data.value) === 3)) {
        fireOnce();
        return;
      }

      // 백엔드 처리 완료 이벤트
      if (data?.type === "process_status" && data.status === "finished") {
        fireOnce();
        return;
      }

      // 선택: redirect 페이로드를 메인으로 보낼 때도 처리
      if (data?.type === "redirect" && data.page === "/main") {
        fireOnce();
        return;
      }
    });

    return () => off();
  }, [fireOnce]);

  // 키보드 3으로도 복귀 (디버그용)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "3" || e.code === "Digit3" || e.code === "Numpad3") {
        fireOnce();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fireOnce]);

  // 페이지 진입: 밀봉 시작 / 이탈: 정지
  useEffect(() => {
    fetch(getHttpUrl("/control/seal"), { method: "POST" }).catch(() => {});
    return () => {
      fetch(getHttpUrl("/control/stop"), { method: "POST" }).catch(() => {});
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Seal the Wine</div>
      <div className={styles.section}>
        <div className={styles.rectangle}>
          <img
            src={getHttpUrl("/video_feed")}
            alt="Yolo Stream"
            className={styles.rectangle_img}
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  );
};

export default CloseWine;
