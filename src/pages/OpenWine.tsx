import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import styles from "../styles/Wine.module.css";
import chevron from "../assets/chevron.svg";
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

  useEffect(() => {
    const off = subscribeWS(getWebSocketUrl("/ws"), (e) => {
      let data: any = e.data;

      // 문자열 프레임 처리
      if (typeof data === "string") {
        const t = data.trim?.();
        if (t === "1") {
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
      if (data?.type === "button" && Number(data.value) === 1) {
        fireOnce(); // 1만 처리
      }

      // detections 등은 필요 시 사용
      // if (data?.type === "detections") { ... }
    });

    return () => off();
  }, [fireOnce]);

  // 키보드로도 1만 실행 (테스트/대안용)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1") {
        fireOnce();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fireOnce]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.goback}>
        <img onClick={onClick} src={chevron} alt="뒤로가기" />
      </div>
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
