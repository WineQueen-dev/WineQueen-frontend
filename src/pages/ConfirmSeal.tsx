import styles from "../styles/MainPage.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState, useRef } from "react";

const ConfirmSeal = () => {
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClose = () => {
    navigate("/main/confirmseal/close");
  };
  const handleCancel = () => {
    navigate("/main");
  };
  const buttonActions = [handleClose, handleCancel];
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

export default ConfirmSeal;
