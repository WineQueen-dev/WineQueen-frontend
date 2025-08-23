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

    // 연속 입력 방지용 (예: 300ms)
    let lastAt = 0;
    const COOLDOWN_MS = 300;

    socket.onopen = () => {
      console.log("✅ WS connected");
      // 필요하면 ping 타이머
      // pingTimer = setInterval(() => socket.readyState === 1 && socket.send("ping"), 5000);
    };

    socket.onmessage = (e) => {
      // 1) JSON 아닌 메시지(ping/pong 등) 대비
      let msg: any;
      try {
        msg = JSON.parse(e.data);
      } catch {
        // console.debug("non-JSON WS message:", e.data);
        return;
      }

      // 2) 버튼 이벤트만 처리
      if (msg?.type === "button") {
        const now = Date.now();
        if (now - lastAt < COOLDOWN_MS) return; // 디바운스
        lastAt = now;

        if (msg.value === 1) {
          buttonRefs.current[0]?.click?.();
          console.log("button1 click");
        } else if (msg.value === 2) {
          buttonRefs.current[1]?.click?.();
          console.log("button2 click");
        } else if (msg.value === 3) {
          buttonRefs.current[2]?.click?.();
          console.log("button3 click");
        }
      }

      // 3) YOLO 스트림도 같은 WS로 온다면 여기서 분기해서 처리
      // else if (msg?.detections) { ... }
    };

    socket.onerror = (err) => console.error("WS error:", err);
    socket.onclose = () => {
      console.log("❌ WS closed");
      // clearInterval(pingTimer);
    };

    return () => {
      // clearInterval(pingTimer);
      socket.close();
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
