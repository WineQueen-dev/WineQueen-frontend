import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import styles from "../styles/Wine.module.css";
import chevron from "../assets/chevron.svg";
import { getWebSocketUrl, getHttpUrl } from "../constants/constants";
import { subscribeWS } from "../lib/ws";

const OpenWine = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const wineNumber = queryParams.get("wine") || "0";

  useEffect(() => {
    const off = subscribeWS(getWebSocketUrl("/ws"), (e) => {
      let msg: any;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if ("detections" in msg) {
        // 필요시 감지 데이터 처리/표시
        // console.log("YOLO:", msg);
      }
    });
    return () => {
      off();
    }; // 구독만 해제
  }, []);

  const onClick = () => {
    navigate("/main");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.goback}>
        <img onClick={onClick} src={chevron} alt="뒤로가기" />
      </div>
      <div className={styles.header}>{wineNumber}. Open the Wine</div>
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
