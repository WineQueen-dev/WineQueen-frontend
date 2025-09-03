import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import styles from "../styles/Wine.module.css";
import { getWebSocketUrl, getHttpUrl } from "../constants/constants";
import { subscribeWS } from "../lib/ws";

const OpenWine = () => {
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

  // ✅ WS에서 'F' 또는 process_status: finished 수신 시 즉시 navigate
  useEffect(() => {
    const off = subscribeWS(getWebSocketUrl("/ws"), (e) => {
      let data: any = e.data;

      if (typeof data === "string") {
        const t = data.trim?.();

        // 하트비트/기타 무시
        if (t === "ping" || t === "pong") return;

        // 🔸 시리얼에서 바로 'F'가 오는 경우
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

      // 🔸 버튼 3 이벤트 그대로 유지
      if (data?.type === "button" && Number(data.value) === 3) {
        fireOnce();
        return;
      }

      // 🔸 백엔드에서 보내는 처리 완료 이벤트
      if (data?.type === "process_status" && data.status === "finished") {
        fireOnce();
        return;
      }
    });

    return () => off();
  }, [fireOnce]);

  // 키보드 단축키(3)로도 돌아가기
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "3" || e.code === "Digit3" || e.code === "Numpad3") {
        fireOnce();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fireOnce]);

  // 페이지 진입 시 개봉 시작, 이탈 시 정지
  useEffect(() => {
    fetch(getHttpUrl("/control/open"), { method: "POST" }).catch(() => {});
    return () => {
      fetch(getHttpUrl("/control/stop"), { method: "POST" }).catch(() => {});
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Open the Wine</div>
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

export default OpenWine;
