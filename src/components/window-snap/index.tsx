"use client";

import { useEffect, useRef, useState } from "react";
import { Window, PhysicalPosition } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

type Edge = "top" | "bottom" | "left" | "right";

const EDGE_CONFIG = {
  top: { style: { top: 0, left: "50%", transform: "translateX(-50%)" }, label: "⬇️" },
  bottom: { style: { bottom: 0, left: "50%", transform: "translateX(-50%)" }, label: "⬆️" },
  left: { style: { top: "50%", left: 0, transform: "translateY(-50%)" }, label: "➡️" },
  right: { style: { top: "50%", right: 0, transform: "translateY(-50%)" }, label: "⬅️" },
};

const appWindow = new Window("main");

export default function WindowSnap() {
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const [hiddenEdge, setHiddenEdge] = useState<Edge | null>(null);

  useEffect(() => {
    appWindow.outerPosition().then(pos => {
      lastPositionRef.current = { x: pos.x, y: pos.y };
    });

    const unlisten = listen("window-edge-hide", async (event) => {
      const edge = event.payload as Edge;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      const last = lastPositionRef.current ?? { x: 0, y: 0 };
      let newX = last.x;
      let newY = last.y;

      switch (edge) {
        case "top":
          newY = -10;
          break;
        case "bottom":
          newY = screenHeight - 10;
          break;
        case "left":
          newX = -10;
          break;
        case "right":
          newX = screenWidth - 10;
          break;
      }
      const newPosition = new PhysicalPosition(newX, newY);
      console.log('newPosition', newPosition);
      await appWindow.setPosition(newPosition);
      setHiddenEdge(edge);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const restoreWindow = async () => {
    if (lastPositionRef.current) {
      const newPosition = new PhysicalPosition(lastPositionRef.current.x, lastPositionRef.current.y);
      console.log('newPosition', newPosition);
      await appWindow.setPosition(newPosition);
    }
    setHiddenEdge(null);
  };

  return (
    <>
      {hiddenEdge && (
        <div
          onMouseEnter={restoreWindow}
          style={{
            position: "fixed",
            zIndex: 9999,
            width: 40,
            height: 40,
            background: "#333",
            color: "white",
            borderRadius: 8,
            textAlign: "center",
            lineHeight: "40px",
            cursor: "pointer",
            ...EDGE_CONFIG[hiddenEdge].style,
          }}
        >
          {EDGE_CONFIG[hiddenEdge].label}
        </div>
      )}
    </>
  );
}