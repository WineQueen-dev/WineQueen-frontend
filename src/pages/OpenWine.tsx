import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import styles from "../styles/Wine.module.css";
import chevron from "../assets/chevron.svg";
import { getWebSocketUrl, getHttpUrl, NetWorkIp } from "../constants/constants";

const OpenWine = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const wineNumber = queryParams.get("wine") || "0";

  useEffect(() => {
    const socket = new WebSocket(getWebSocketUrl("/ws"));

    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, 5000);

    socket.onopen = () => {
      console.log("✅ WebSocket 연결됨:", getWebSocketUrl("/ws"));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📡 YOLO 데이터 수신:", data);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket 연결 종료");
      clearInterval(pingInterval);
    };

    return () => {
      socket.close();
      clearInterval(pingInterval);
    };
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
