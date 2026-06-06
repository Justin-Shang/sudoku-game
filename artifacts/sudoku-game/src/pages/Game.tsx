import { useState, useEffect, useCallback } from "react";
import { generatePuzzle, isValidPlacement } from "@/lib/sudoku";
import { Heart, Timer, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type CellType = {
  value: number | null;
  isClue: boolean;
  isError: boolean;
};

type HistoryEntry = {
  row: number;
  col: number;
  prevValue: number | null;
  isError: boolean;
};

export default function Game() {
  const [board, setBoard] = useState<CellType[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [undosLeft, setUndosLeft] = useState(3);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const initGame = useCallback(() => {
    const { puzzle, solution: sol } = generatePuzzle();
    setSolution(sol);
    setBoard(
      puzzle.map((row) =>
        row.map((val) => ({
          value: val,
          isClue: val !== null,
          isError: false,
        }))
      )
    );
    setHistory([]);
    setUndosLeft(3);
    setTime(0);
    setIsPlaying(true);
    setIsWon(false);
    setSelectedCell(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isWon) {
      timer = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isWon]);

  const handleCellClick = (r: number, c: number) => {
    if (!isPlaying || isWon) return;
    if (selectedCell?.r === r && selectedCell?.c === c) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ r, c });
    }
  };

  const handleInput = useCallback(
    (num: number | null) => {
      if (!isPlaying || isWon || !selectedCell) return;
      const { r, c } = selectedCell;
      if (board[r][c].isClue) return;

      const prevValue = board[r][c].value;
      if (prevValue === num) return;

      const isError = num !== null && !isValidPlacement(board.map(row => row.map(cell => cell.value)), r, c, num);

      const newBoard = [...board];
      newBoard[r] = [...newBoard[r]];
      newBoard[r][c] = {
        ...newBoard[r][c],
        value: num,
        isError,
      };

      setBoard(newBoard);
      
      setHistory((prev) => [...prev, { row: r, col: c, prevValue, isError: board[r][c].isError }]);

      // Check win condition
      if (num !== null && !isError) {
        let complete = true;
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (newBoard[i][j].value === null || newBoard[i][j].isError) {
              complete = false;
              break;
            }
          }
        }
        if (complete) setIsWon(true);
      }
    },
    [board, isPlaying, isWon, selectedCell]
  );

  const handleUndo = () => {
    if (undosLeft <= 0 || history.length === 0 || isWon) return;
    const lastAction = history[history.length - 1];
    
    const newBoard = [...board];
    newBoard[lastAction.row] = [...newBoard[lastAction.row]];
    newBoard[lastAction.row][lastAction.col] = {
      ...newBoard[lastAction.row][lastAction.col],
      value: lastAction.prevValue,
      isError: lastAction.isError,
    };
    
    setBoard(newBoard);
    setHistory((prev) => prev.slice(0, -1));
    setUndosLeft((prev) => prev - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !isPlaying || isWon) return;
      
      if (e.key >= "1" && e.key <= "9") {
        handleInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleInput(null);
      } else if (e.key === "ArrowUp") {
        setSelectedCell((prev) => prev ? { r: Math.max(0, prev.r - 1), c: prev.c } : null);
      } else if (e.key === "ArrowDown") {
        setSelectedCell((prev) => prev ? { r: Math.min(8, prev.r + 1), c: prev.c } : null);
      } else if (e.key === "ArrowLeft") {
        setSelectedCell((prev) => prev ? { r: prev.r, c: Math.max(0, prev.c - 1) } : null);
      } else if (e.key === "ArrowRight") {
        setSelectedCell((prev) => prev ? { r: prev.r, c: Math.min(8, prev.c + 1) } : null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, selectedCell, isPlaying, isWon]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectedNumber = selectedCell && board[selectedCell.r] && board[selectedCell.r][selectedCell.c] ? board[selectedCell.r][selectedCell.c].value : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center py-4 px-4 relative overflow-hidden">
      <div className="w-full max-w-4xl z-10 relative flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-5 py-3 rounded-3xl shadow-sm border border-white">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Timer className="w-5 h-5" />
            <span className="w-14">{formatTime(time)}</span>
          </div>
          <h1 className="text-2xl font-black text-secondary-foreground tracking-tight animate-float" style={{ textShadow: "0 2px 0 rgba(255,255,255,0.8)" }}>
            数独 Sudoku
          </h1>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <Heart
                key={i}
                className={`w-6 h-6 transition-all duration-300 ${
                  i <= undosLeft ? "fill-accent text-accent" : "fill-gray-200 text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main area: board + side panel */}
        <div className="flex gap-4 items-start">

          {/* Board */}
          <div className="flex-1 bg-white p-2 rounded-[1.5rem] shadow-xl border-4 border-primary/20">
            <div className="grid grid-cols-9 gap-0.5 bg-primary/20 border-4 border-primary rounded-xl overflow-hidden">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const isRelated = selectedCell && (selectedCell.r === r || selectedCell.c === c || (Math.floor(selectedCell.r / 3) === Math.floor(r / 3) && Math.floor(selectedCell.c / 3) === Math.floor(c / 3)));
                  const isSameNumber = cell.value !== null && cell.value === selectedNumber;

                  const borderRight = c === 2 || c === 5 ? "border-r-4 border-r-primary/40" : "border-r border-r-primary/10";
                  const borderBottom = r === 2 || r === 5 ? "border-b-4 border-b-primary/40" : "border-b border-b-primary/10";

                  let cellBg = "bg-white";
                  if (isSelected) cellBg = "bg-secondary/40";
                  else if (cell.isError) cellBg = "bg-destructive/20";
                  else if (isSameNumber && !isSelected) cellBg = "bg-primary/20";
                  else if (isRelated) cellBg = "bg-muted/50";
                  else if (cell.isClue) cellBg = "bg-amber-50/50";

                  let textColor = "text-foreground";
                  if (cell.isError) textColor = "text-destructive font-black";
                  else if (cell.isClue) textColor = "text-foreground font-black";
                  else if (cell.value) textColor = "text-primary font-bold";

                  return (
                    <button
                      key={`${r}-${c}`}
                      className={`
                        aspect-square flex items-center justify-center text-xl sm:text-2xl transition-all duration-150
                        ${borderRight} ${borderBottom} ${cellBg} ${textColor}
                        ${cell.isError ? "animate-shake" : ""}
                        ${!cell.isClue && !isSelected ? "hover:bg-secondary/40 hover:scale-95 cursor-pointer" : ""}
                        ${isSelected ? "ring-2 ring-primary ring-inset" : ""}
                      `}
                      onClick={() => handleCellClick(r, c)}
                      data-testid={`cell-${r}-${c}`}
                    >
                      {cell.value || ""}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Side Panel: hint + number picker + buttons */}
          <div className="flex flex-col gap-3 w-36 shrink-0">

            {/* Hint */}
            <div className="bg-white/80 rounded-2xl px-3 py-2 text-center shadow-sm border border-white">
              {!selectedCell || board[selectedCell.r]?.[selectedCell.c]?.isClue ? (
                <p className="text-muted-foreground text-xs font-semibold leading-tight animate-pulse">
                  👆 先点空白格
                </p>
              ) : (
                <p className="text-primary text-xs font-semibold leading-tight">
                  ✨ 选一个数字
                </p>
              )}
            </div>

            {/* Number Picker: 3×3 grid for 1-9 */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-white">
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInput(num)}
                    disabled={!selectedCell || board[selectedCell.r]?.[selectedCell.c]?.isClue || isWon}
                    className="aspect-square flex items-center justify-center text-xl font-bold bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed shadow-sm"
                    data-testid={`num-btn-${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {/* Clear button */}
              <button
                onClick={() => handleInput(null)}
                disabled={!selectedCell || board[selectedCell.r]?.[selectedCell.c]?.isClue || isWon}
                className="w-full mt-1.5 py-1.5 flex items-center justify-center gap-1 bg-muted text-muted-foreground rounded-xl hover:bg-destructive hover:text-white transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-bold shadow-sm"
                data-testid="num-btn-clear"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清除
              </button>
            </div>

            {/* Action buttons */}
            <Button
              variant="secondary"
              className="w-full rounded-2xl font-bold shadow-sm gap-1.5 text-sm"
              onClick={handleUndo}
              disabled={undosLeft <= 0 || history.length === 0 || isWon}
              data-testid="button-undo"
            >
              <RotateCcw className="w-4 h-4" />
              反悔 ({undosLeft})
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-2xl font-bold shadow-sm text-sm"
              onClick={initGame}
              data-testid="button-new-game"
            >
              新游戏
            </Button>
          </div>
        </div>
      </div>

      {/* Win Overlay */}
      {isWon && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-primary max-w-sm w-full mx-4 text-center animate-pop">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-primary mb-2">You did it!</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Time: <span className="font-bold text-foreground">{formatTime(time)}</span>
            </p>
            <Button 
              size="lg" 
              className="w-full text-xl h-14 rounded-full font-bold shadow-lg"
              onClick={initGame}
            >
              Play Again!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
