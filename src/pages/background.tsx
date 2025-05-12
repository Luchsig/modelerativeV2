import { useEffect, useRef, useState } from "react";
import "../styles/background.css";

interface Square {
  id: number;
  size: number;
  left: string;
  top: string;
  duration: number;
  rotation: number;
  directionX: number;
  directionY: number;
}

const MAX_SQUARES = 50;

const Background = () => {
  const [squares, setSquares] = useState<Square[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let mounted = true;

    const spawn = () => {
      if (!mounted) return;

      setSquares((prev) => {
        if (prev.length >= MAX_SQUARES) return prev;

        const newSquare: Square = {
          id: Date.now() + Math.random(),
          size: Math.random() * 150 + 20,
          left: Math.random() * 100 + "vw",
          top: Math.random() * 100 + "vh",
          duration: Math.random() * 5 + 5,
          rotation: Math.random() * 360,
          directionX: Math.random() * 2 - 1,
          directionY: Math.random() * -1 - 0.5,
        };

        const removeTimeout = setTimeout(() => {
          setSquares((curr) => curr.filter((s) => s.id !== newSquare.id));
        }, newSquare.duration * 1000);

        timeouts.current.push(removeTimeout);

        return [...prev, newSquare];
      });

      const spawnTimeout = setTimeout(spawn, Math.random() * 600);

      timeouts.current.push(spawnTimeout);
    };

    spawn();

    return () => {
      mounted = false;
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  return (
    <div className="background-container fixed w-full h-full overflow-hidden bg-gradient-to-b dark:from-black dark:to-purple-900 from-white to-purple-900 -z-10">
      {squares.map((square) => (
        <div
          key={square.id}
          className="square absolute bg-gradient-to-br from-pink-300 to-purple-200 dark:from-pink-600 dark:to-purple-800 rounded-lg"
          style={{
            width: square.size,
            height: square.size,
            left: square.left,
            top: square.top,
            animationDuration: `${square.duration}s`,
            transform: `rotate(${square.rotation}deg)`,
          }}
        />
      ))}
      <div className="dark:bg-black bg-white dark:opacity-60 opacity-30 -z-10 absolute w-dvw h-dvh" />
    </div>
  );
};

export default Background;
