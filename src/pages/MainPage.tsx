import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "../styles/MainPage.module.css";
import Wine_1 from "../assets/Wine_1.svg";
import { getWebSocketUrl, getHttpUrl } from "../constants/constants";

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "No record of sealing";
  const date = new Date(dateStr);
  return isNaN(date.getTime())
    ? "No record of sealing"
    : `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

const MainPage = () => {
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "button" && msg.value === 1) {
        buttonRefs.current[0]?.click();
      }
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

  const setStorage = (value: string | null) => {
    if (value) localStorage.setItem("startTime", value);
    else localStorage.removeItem("startTime");
  };

  const handleOpen = () => navigate("/open?wine=1");

  const handleClose = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setStorage(now);
    navigate("/close?wine=1");
  };

  const handleReset = () => {
    setStartTime(null);
    setStorage(null);
  };

  const buttonActions = [handleOpen, handleClose, handleReset];

  // 초기값 로드
  useEffect(() => {
    setStartTime(localStorage.getItem("startTime"));
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setFocusedIndex((prev) => (prev + 1) % buttonActions.length);
      } else if (e.key === "ArrowLeft") {
        setFocusedIndex(
          (prev) => (prev - 1 + buttonActions.length) % buttonActions.length
        );
      } else if (e.key === "Enter") {
        buttonActions[focusedIndex]?.();
      }
    },
    [focusedIndex, buttonActions]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    buttonRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <div className={styles.containerWrapper}>
      <div className={styles.header}>
        <div>
          <div>
            <span style={{ color: "#FFF" }}>Please select </span>
            <span style={{ color: "#FFF" }}>the </span>
            <span style={{ color: "#2C001E" }}>Wines</span>
          </div>
          <span style={{ color: "#FFF" }}>you would like to</span>
          <span style={{ color: "#FFDB58" }}> Open/Seal</span>
        </div>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.section}>
          <div>
            <button
              ref={(el) => {
                buttonRefs.current[0] = el;
              }}
              className={styles.button}
              onClick={handleOpen}
            >
              Open
            </button>
            <button
              ref={(el) => {
                buttonRefs.current[1] = el;
              }}
              className={styles.button}
              onClick={handleClose}
            >
              Seal
            </button>
          </div>

          <div className={styles.rectangle}>
            <img src={Wine_1} alt="와인1" />
          </div>

          <div className={styles.data}>
            {startTime && <div>Last sealed date</div>}
            <div>{formatDate(startTime)}</div>
            <button
              ref={(el) => {
                buttonRefs.current[2] = el;
              }}
              className={styles.button}
              onClick={handleReset}
            >
              Reset Date
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
