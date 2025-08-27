import styles from "../styles/MainPage.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState, useRef } from "react";
import { getWebSocketUrl } from "../constants/constants";
import { subscribeWS } from "../lib/ws";

const ConfirmOpen = () => {
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClose = () => {
    navigate("/main/confirmopen/open");
  };
  const handleCancel = () => {
    navigate("/main");
  };
  const buttonActions = [handleClose, handleCancel];

  // 🔸 WS: 1 → Yes 클릭, 2 → No 클릭
  const handleWSMessage = useCallback((e: MessageEvent) => {
    let data: any = e.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        // 혹시 숫자 평문이면 처리
        const t = data.trim?.();
        if (t === "1") {
          buttonRefs.current[0]?.click?.();
        } else if (t === "2") {
          buttonRefs.current[1]?.click?.();
        }
        return;
      }
    }
    if (data?.type === "button") {
      const v = Number(data.value);
      if (v === 1) buttonRefs.current[0]?.click?.(); // Yes
      else if (v === 2) buttonRefs.current[1]?.click?.(); // No
      // v===3은 이 화면에선 무시
    }
  }, []);

  useEffect(() => {
    const off = subscribeWS(getWebSocketUrl("/ws"), handleWSMessage);
    return () => off();
  }, [handleWSMessage]);

  // 키보드 네비게이션 + 1/2 바로 실행
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
      } else if (e.key === "1" || e.code === "Digit1" || e.code === "Numpad1") {
        // 1 → Yes
        buttonRefs.current[0]?.click?.();
      } else if (e.key === "2" || e.code === "Digit2" || e.code === "Numpad2") {
        // 2 → No
        buttonRefs.current[1]?.click?.();
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
          <span style={{ color: "#FFF" }}>Did you </span>
          <span style={{ color: "#FFDB58" }}>put</span>
          <span style={{ color: "#FFF" }}> the </span>
          <span style={{ color: "#2C001E" }}>Wine</span>
          <span style={{ color: "#FFF" }}> on?</span>
        </div>
      </div>
      <div className={styles.button_wrapper}>
        <button
          ref={(el) => {
            buttonRefs.current[0] = el;
          }}
          className={styles.confirm_button}
          onClick={handleClose}
        >
          Yes
        </button>
        <button
          ref={(el) => {
            buttonRefs.current[1] = el;
          }}
          className={styles.confirm_button}
          onClick={handleCancel}
        >
          No
        </button>
      </div>
    </div>
  );
};

export default ConfirmOpen;
