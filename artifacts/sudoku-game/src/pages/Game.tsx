import { useState, useEffect, useCallback } from "react";
import { generatePuzzle, isValidPlacement } from "@/lib/sudoku";
import { Heart, Timer, RotateCcw, Sparkles, Settings, X } from "lucide-react";
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

type Difficulty = "easy" | "medium" | "hard" | "expert";
type Theme = "pink" | "ocean" | "sunny" | "night";

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; emoji: string; clues: number; desc: string }> = {
  easy:   { label: "初级",   emoji: "🌸", clues: 38, desc: "适合新手，提示较多" },
  medium: { label: "中级",   emoji: "🌊", clues: 32, desc: "需要一点推理技巧" },
  hard:   { label: "高级",   emoji: "🔥", clues: 26, desc: "考验逻辑，挑战自我" },
  expert: { label: "专家",   emoji: "⚡", clues: 22, desc: "对标数独竞技大师" },
};

const THEME_CONFIG: Record<Theme, { label: string; colors: string[]; dataTheme: string }> = {
  pink:  { label: "粉色少女", colors: ["#c084fc", "#fb7185", "#fde68a"], dataTheme: "" },
  ocean: { label: "深海蓝",   colors: ["#3b82f6", "#14b8a6", "#7dd3fc"], dataTheme: "ocean" },
  sunny: { label: "阳光橙",   colors: ["#f97316", "#eab308", "#fb923c"], dataTheme: "sunny" },
  night: { label: "星空夜",   colors: ["#a855f7", "#38bdf8", "#facc15"], dataTheme: "night" },
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
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [theme, setTheme] = useState<Theme>("pink");
  const [showSettings, setShowSettings] = useState(false);

  // Apply theme to document root
  useEffect(() => {
    const cfg = THEME_CONFIG[theme];
    if (cfg.dataTheme) {
      document.documentElement.setAttribute("data-theme", cfg.dataTheme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  const initGame = useCallback((diff?: Difficulty) => {
    const d = diff ?? difficulty;
    const { puzzle, solution: sol } = generatePuzzle(DIFFICULTY_CONFIG[d].clues);
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
  }, [difficulty]);

  useEffect(() => {
    initGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isWon) {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
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

      const isError =
        num !== null &&
        !isValidPlacement(board.map((row) => row.map((cell) => cell.value)), r, c, num);

      const newBoard = board.map((row, ri) =>
        ri === r
          ? row.map((cell, ci) =>
              ci === c ? { ...cell, value: num, isError } : cell
            )
          : [...row]
      );

      setBoard(newBoard);
      setHistory((prev) => [...prev, { row: r, col: c, prevValue, isError: board[r][c].isError }]);

      if (num !== null && !isError) {
        const complete = newBoard.every((row) =>
          row.every((cell) => cell.value !== null && !cell.isError)
        );
        if (complete) setIsWon(true);
      }
    },
    [board, isPlaying, isWon, selectedCell]
  );

  const handleUndo = () => {
    if (undosLeft <= 0 || history.length === 0 || isWon) return;
    const last = history[history.length - 1];
    const newBoard = board.map((row, ri) =>
      ri === last.row
        ? row.map((cell, ci) =>
            ci === last.col ? { ...cell, value: last.prevValue, isError: last.isError } : cell
          )
        : [...row]
    );
    setBoard(newBoard);
    setHistory((prev) => prev.slice(0, -1));
    setUndosLeft((prev) => prev - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !isPlaying || isWon) return;
      if (e.key >= "1" && e.key <= "9") handleInput(parseInt(e.key));
      else if (e.key === "Backspace" || e.key === "Delete") handleInput(null);
      else if (e.key === "ArrowUp")
        setSelectedCell((p) => p ? { r: Math.max(0, p.r - 1), c: p.c } : null);
      else if (e.key === "ArrowDown")
        setSelectedCell((p) => p ? { r: Math.min(8, p.r + 1), c: p.c } : null);
      else if (e.key === "ArrowLeft")
        setSelectedCell((p) => p ? { r: p.r, c: Math.max(0, p.c - 1) } : null);
      else if (e.key === "ArrowRight")
        setSelectedCell((p) => p ? { r: p.r, c: Math.min(8, p.c + 1) } : null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, selectedCell, isPlaying, isWon]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectedNumber =
    selectedCell && board[selectedCell.r]?.[selectedCell.c]
      ? board[selectedCell.r][selectedCell.c].value
      : null;

  const canInput =
    !!selectedCell && !board[selectedCell.r]?.[selectedCell.c]?.isClue && !isWon;

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    setShowSettings(false);
    initGame(d);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center py-4 px-4 relative overflow-hidden">
      <div className="w-full max-w-4xl z-10 relative flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-5 py-3 rounded-3xl shadow-sm border border-white">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Timer className="w-5 h-5" />
            <span className="w-14">{formatTime(time)}</span>
          </div>
          <h1
            className="text-2xl font-black text-secondary-foreground tracking-tight animate-float"
            style={{ textShadow: "0 2px 0 rgba(255,255,255,0.8)" }}
          >
            {DIFFICULTY_CONFIG[difficulty].emoji} 数独 Sudoku
          </h1>
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => setShowSettings(true)}
              className="ml-1 p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main area */}
        <div className="flex gap-4 items-start">

          {/* Board */}
          <div className="flex-1 bg-white p-2 rounded-[1.5rem] shadow-xl border-4 border-primary/20">
            <div className="grid grid-cols-9 gap-0.5 bg-primary/20 border-4 border-primary rounded-xl overflow-hidden">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const isRelated =
                    selectedCell &&
                    (selectedCell.r === r ||
                      selectedCell.c === c ||
                      (Math.floor(selectedCell.r / 3) === Math.floor(r / 3) &&
                        Math.floor(selectedCell.c / 3) === Math.floor(c / 3)));
                  const isSameNumber = cell.value !== null && cell.value === selectedNumber;

                  const borderRight =
                    c === 2 || c === 5 ? "border-r-4 border-r-primary/40" : "border-r border-r-primary/10";
                  const borderBottom =
                    r === 2 || r === 5 ? "border-b-4 border-b-primary/40" : "border-b border-b-primary/10";

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

          {/* Side Panel */}
          <div className="flex flex-col gap-3 w-36 shrink-0">

            {/* Hint */}
            <div className="bg-white/80 rounded-2xl px-3 py-2 text-center shadow-sm border border-white">
              {!canInput ? (
                <p className="text-muted-foreground text-xs font-semibold leading-tight animate-pulse">
                  👆 先点空白格
                </p>
              ) : (
                <p className="text-primary text-xs font-semibold leading-tight">
                  ✨ 选一个数字
                </p>
              )}
            </div>

            {/* Number Picker */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-white">
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInput(num)}
                    disabled={!canInput}
                    className="aspect-square flex items-center justify-center text-xl font-bold bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed shadow-sm"
                    data-testid={`num-btn-${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleInput(null)}
                disabled={!canInput}
                className="w-full mt-1.5 py-1.5 flex items-center justify-center gap-1 bg-muted text-muted-foreground rounded-xl hover:bg-destructive hover:text-white transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed text-xs font-bold shadow-sm"
                data-testid="num-btn-clear"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清除
              </button>
            </div>

            {/* Undo */}
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

            {/* New Game */}
            <Button
              variant="outline"
              className="w-full rounded-2xl font-bold shadow-sm text-sm"
              onClick={() => initGame()}
              data-testid="button-new-game"
            >
              新游戏
            </Button>

            {/* Difficulty badge */}
            <div className="text-center">
              <span className="text-xs font-bold text-muted-foreground bg-white/70 px-2 py-1 rounded-full">
                {DIFFICULTY_CONFIG[difficulty].emoji} {DIFFICULTY_CONFIG[difficulty].label}
              </span>
            </div>
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
            <h2 className="text-4xl font-black text-primary mb-1">太棒了！</h2>
            <p className="text-muted-foreground text-sm mb-1">
              {DIFFICULTY_CONFIG[difficulty].emoji} {DIFFICULTY_CONFIG[difficulty].label}
            </p>
            <p className="text-xl text-muted-foreground mb-8">
              用时 <span className="font-bold text-foreground">{formatTime(time)}</span>
            </p>
            <Button
              size="lg"
              className="w-full text-xl h-14 rounded-full font-bold shadow-lg"
              onClick={() => initGame()}
            >
              再来一局！
            </Button>
          </div>
        </div>
      )}

      {/* Settings Overlay */}
      {showSettings && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <div className="bg-card border-2 border-primary/30 rounded-[2rem] shadow-2xl w-full max-w-md mx-4 p-6 animate-pop">

            {/* Settings header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black text-foreground">⚙️ 设置</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full bg-muted hover:bg-destructive hover:text-white transition-colors"
                data-testid="button-close-settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Difficulty */}
            <div className="mb-5">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                难度（切换后自动新局）
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => {
                  const cfg = DIFFICULTY_CONFIG[d];
                  const active = difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => handleDifficultyChange(d)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                      data-testid={`difficulty-${d}`}
                    >
                      <div className="text-lg font-black">
                        {cfg.emoji} {cfg.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{cfg.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skin */}
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                皮肤（即时生效）
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEME_CONFIG) as Theme[]).map((t) => {
                  const cfg = THEME_CONFIG[t];
                  const active = theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                      data-testid={`theme-${t}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {cfg.colors.map((color, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-white/60 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {active && <span className="text-primary text-xs font-bold">✓</span>}
                      </div>
                      <div className="text-sm font-black text-foreground">{cfg.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
