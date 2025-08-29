import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import styles from "../styles/Wine.module.css";
import { NetWorkIp } from "../constants/constants";
import chevron from "../assets/chevron.svg";
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

  useEffect(() => {
    const off = subscribeWS(getWebSocketUrl("/ws"), (e) => {
      let data: any = e.data;

      // 문자열 프레임 처리 ("1"/"ping" 등)
      if (typeof data === "string") {
        const t = data.trim?.();
        if (t === "3") {
          fireOnce();
          return;
        } // 1만 처리
        if (t === "ping" || t === "pong") return; // 하트비트 무시
        try {
          data = JSON.parse(t);
        } catch {
          return;
        }
      }

      // JSON 프레임 처리
      if (data?.type === "button" && Number(data.value) === 3) {
        fireOnce(); // 1만 처리
      }

      // detections 필요 시 사용
      // if (data?.type === "detections") { ... }
    });

    return () => off();
  }, [fireOnce]);

  // 키보드로도 3만 실행 (테스트/대안용)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "3" || e.code === "Digit3" || e.code === "Numpad3") {
        fireOnce();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fireOnce]);

  useEffect(() => {
    fetch(getHttpUrl("/control/seal"), { method: "POST" }).catch(() => {});
    return () => {
      fetch(getHttpUrl("/control/stop"), { method: "POST" }).catch(() => {});
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.goback}>
        <img onClick={onClick} src={chevron} alt="뒤로가기" />
      </div>
      <div className={styles.header}>Seal the Wine</div>
      <div className={styles.section}>
        <div className={styles.rectangle}>
          <img
            src={"http://" + NetWorkIp + "/video_feed"}
            alt="Yolo Stream"
            className={styles.rectangle_img}
            crossOrigin="anonymous"
          />
        </div>
        <div className={styles.sensor}>atmospheric pressure | </div>
      </div>
    </div>
  );
};

export default CloseWine;
