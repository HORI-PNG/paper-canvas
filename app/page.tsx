"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type {
  Group,
  Memo,
  MemoColor,
  Paper,
  ResizeHandle,
} from "@/types/paper";
import { Header } from "@/components/Header";
import { PaperCard } from "@/components/PaperCard";
import { MemoCard } from "@/components/MemoCard";
import { GroupFrame } from "@/components/GroupFrame";
import { RightDrawer } from "@/components/RightDrawer";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { GroupCreator } from "@/components/GroupCreator";
import { IC } from "@/components/Icons";

const INITIAL_PAPERS: Paper[] = [
  {
    id: "p1",
    title: "Attention Is All You Need",
    authors: ["A. Vaswani", "N. Shazeer", "N. Parmar"],
    year: 2017,
    bullets: [
      "リカレンスと畳み込みを廃した、アテンション機構のみによる新アーキテクチャ「Transformer」を提案。",
      "機械翻訳タスクで当時の最高精度を達成し、並列化により学習時間を大幅に短縮。",
      "現在の大規模言語モデルの基盤となる画期的な研究。",
    ],
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
    tags: ["Transformer", "Attention", "NLP"],
    url: "https://arxiv.org/abs/1706.03762",
    createdDate: "2026-09-15",
    x: 80,
    y: 70,
    color: "indigo",
  },
  {
    id: "p2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: ["J. Devlin", "M-W. Chang", "K. Lee"],
    year: 2018,
    bullets: [
      "マスク言語モデリングを用いた双方向事前学習表現「BERT」を導入。",
      "11のNLPベンチマークで新たな最高性能を達成。",
      "事前学習済みモデルの普及を加速させた重要研究。",
    ],
    abstract:
      "We introduce BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations from unlabeled text.",
    tags: ["BERT", "事前学習", "NLP"],
    url: "https://arxiv.org/abs/1810.04805",
    createdDate: "2026-09-16",
    x: 430,
    y: 65,
    color: "violet",
  },
  {
    id: "p3",
    title: "Deep Residual Learning for Image Recognition",
    authors: ["K. He", "X. Zhang", "S. Ren", "J. Sun"],
    year: 2015,
    bullets: [
      "スキップ接続によって勾配消失問題を解決する残差学習を提案。",
      "152層のResNetでImageNet エラー率3.57%を達成。",
      "深層学習の標準アーキテクチャとして現在も広く利用。",
    ],
    abstract:
      "We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.",
    tags: ["ResNet", "画像認識", "深層学習"],
    url: "https://arxiv.org/abs/1512.03385",
    createdDate: "2026-09-18",
    x: 130,
    y: 380,
    color: "emerald",
  },
  {
    id: "p4",
    title: "Generative Adversarial Networks",
    authors: ["I. Goodfellow", "J. Pouget-Abadie", "M. Mirza"],
    year: 2014,
    bullets: [
      "GeneratorとDiscriminatorが競合するGANフレームワークを提案。",
      "明示的な確率密度推定なしにリアルな画像を生成。",
      "画像生成・スタイル変換など多数の応用の礎となった。",
    ],
    abstract:
      "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models.",
    tags: ["GAN", "生成モデル", "深層学習"],
    url: "https://arxiv.org/abs/1406.2661",
    createdDate: "2026-09-20",
    x: 480,
    y: 375,
    color: "rose",
  },
  {
    id: "p5",
    title: "Playing Atari with Deep Reinforcement Learning",
    authors: ["V. Mnih", "K. Kavukcuoglu", "D. Silver"],
    year: 2013,
    bullets: [
      "生ピクセルを入力とする深層強化学習モデルDQNを提案。",
      "7本中6本のAtariゲームで従来手法を上回るスコア。",
      "ニューラルネット×強化学習融合の先駆的な研究。",
    ],
    abstract:
      "We present the first deep learning model to successfully learn control policies directly from high-dimensional sensory input using reinforcement learning.",
    tags: ["DQN", "強化学習", "Atari"],
    url: "https://arxiv.org/abs/1312.5602",
    createdDate: "2026-09-22",
    x: 800,
    y: 195,
    color: "amber",
  },
];

const INITIAL_GROUPS: Group[] = [
  {
    id: "g1",
    label: "言語モデル",
    x: 40,
    y: 20,
    width: 600,
    height: 300,
    bgColor: "#EEF2FF",
    borderColor: "#4F46E5",
  },
  {
    id: "g2",
    label: "画像・生成モデル",
    x: 70,
    y: 335,
    width: 620,
    height: 300,
    bgColor: "#ECFDF5",
    borderColor: "#059669",
  },
];

const MEMO_COLORS: MemoColor[] = ["yellow", "pink", "blue", "green", "purple"];

export default function Page() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [dark, setDark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [papers, setPapers] = useState(INITIAL_PAPERS);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const [dragTarget, setDragTarget] = useState<{
    id: string;
    type: "paper" | "memo" | "group";
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [resizeTarget, setResizeTarget] = useState<{
    id: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  } | null>(null);

  const [panStart, setPanStart] = useState<{
    mouseX: number;
    mouseY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleMouseDownItem = (
    e: React.MouseEvent,
    id: string,
    type: "paper" | "memo" | "group",
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (type === "paper") {
      const paper = papers.find((item) => item.id === id);
      if (paper) setSelectedPaper(paper);
    }

    const item =
      type === "paper"
        ? papers.find((value) => value.id === id)
        : type === "memo"
          ? memos.find((value) => value.id === id)
          : groups.find((value) => value.id === id);

    if (!item) return;

    setDragTarget({
      id,
      type,
      offsetX: (e.clientX - offset.x) / zoom - item.x,
      offsetY: (e.clientY - offset.y) / zoom - item.y,
    });
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    id: string,
    handle: ResizeHandle,
  ) => {
    e.stopPropagation();
    const group = groups.find((item) => item.id === id);
    if (!group) return;

    setResizeTarget({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: group.x,
      initialY: group.y,
      initialW: group.width,
      initialH: group.height,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragTarget) {
        const x = (e.clientX - offset.x) / zoom - dragTarget.offsetX;
        const y = (e.clientY - offset.y) / zoom - dragTarget.offsetY;

        if (dragTarget.type === "paper") {
          setPapers((items) =>
            items.map((item) =>
              item.id === dragTarget.id ? { ...item, x, y } : item,
            ),
          );
        } else if (dragTarget.type === "memo") {
          setMemos((items) =>
            items.map((item) =>
              item.id === dragTarget.id ? { ...item, x, y } : item,
            ),
          );
        } else {
          setGroups((items) =>
            items.map((item) =>
              item.id === dragTarget.id ? { ...item, x, y } : item,
            ),
          );
        }
        return;
      }

      if (resizeTarget) {
        const dx = (e.clientX - resizeTarget.startX) / zoom;
        const dy = (e.clientY - resizeTarget.startY) / zoom;

        setGroups((items) =>
          items.map((group) => {
            if (group.id !== resizeTarget.id) return group;

            let { initialX: x, initialY: y } = resizeTarget;
            let width = resizeTarget.initialW;
            let height = resizeTarget.initialH;
            const handle = resizeTarget.handle;

            if (handle.includes("e")) {
              width = Math.max(120, resizeTarget.initialW + dx);
            }
            if (handle.includes("s")) {
              height = Math.max(120, resizeTarget.initialH + dy);
            }
            if (handle.includes("w")) {
              const nextWidth = resizeTarget.initialW - dx;
              if (nextWidth > 120) {
                width = nextWidth;
                x = resizeTarget.initialX + dx;
              }
            }
            if (handle.includes("n")) {
              const nextHeight = resizeTarget.initialH - dy;
              if (nextHeight > 120) {
                height = nextHeight;
                y = resizeTarget.initialY + dy;
              }
            }
            return { ...group, x, y, width, height };
          }),
        );
        return;
      }

      if (panStart) {
        setOffset({
          x: panStart.offsetX + e.clientX - panStart.mouseX,
          y: panStart.offsetY + e.clientY - panStart.mouseY,
        });
      }
    },
    [dragTarget, resizeTarget, panStart, offset, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setDragTarget(null);
    setResizeTarget(null);
    setPanStart(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        setZoom((current) =>
          Math.min(2, Math.max(0.25, current - e.deltaY * 0.0025)),
        );
      } else {
        setOffset((current) => ({
          x: current.x - e.deltaX,
          y: current.y - e.deltaY,
        }));
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    setSelectedPaper(null);
    setPanStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    });
  };

  const canvasCenter = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return {
      x: ((rect?.width ?? window.innerWidth) / 2 - offset.x) / zoom,
      y: ((rect?.height ?? window.innerHeight) / 2 - offset.y) / zoom,
    };
  };

  const handleAnalyze = () => {
    const url = urlInput.trim();
    if (!url) return;

    setLoading(true);
    const center = canvasCenter();

    window.setTimeout(() => {
      const arxivId = url.match(/\d{4}\.\d{4,5}/)?.[0] ?? "xxxx.xxxxx";
      const paper: Paper = {
        id: `p-${Date.now()}`,
        title: `arXiv論文 ${arxivId}`,
        authors: ["著者 A", "著者 B"],
        year: new Date().getFullYear(),
        bullets: [
          "AIが自動解析した要約の1点目がここに表示されます。",
          "この論文の主要な貢献と手法の概要が表示されます。",
          "実験結果とベースラインとの比較が表示されます。",
        ],
        abstract: `arXiv:${arxivId} のアブストラクトです。`,
        tags: ["新着", "AI解析"],
        url,
        createdDate: new Date().toISOString().slice(0, 10),
        x: center.x - 134,
        y: center.y - 110,
        color: "sky",
      };
      setPapers((items) => [...items, paper]);
      setSelectedPaper(paper);
      setUrlInput("");
      setLoading(false);
    }, 900);
  };

  const handleAddMemo = () => {
    const center = canvasCenter();
    setMemos((items) => [
      ...items,
      {
        id: `m-${Date.now()}`,
        text: "",
        x: center.x - 104,
        y: center.y - 80,
        color: MEMO_COLORS[items.length % MEMO_COLORS.length],
        createdDate: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const handleCreateGroup = (
    label: string,
    bgColor: string,
    borderColor: string,
  ) => {
    const center = canvasCenter();
    setGroups((items) => [
      ...items,
      {
        id: `g-${Date.now()}`,
        label,
        x: center.x - 240,
        y: center.y - 140,
        width: 480,
        height: 280,
        bgColor,
        borderColor,
      },
    ]);
  };

  const handleDeletePaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPapers((items) => items.filter((item) => item.id !== id));
    setSelectedPaper((item) => (item?.id === id ? null : item));
  };

  const handleDeleteMemo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemos((items) => items.filter((item) => item.id !== id));
  };

  const handleDeleteGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroups((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden ${
        dark ? "dark" : ""
      }`}
      style={{ background: "var(--background)" }}
    >
      <Header
        dark={dark}
        setDark={setDark}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        handleAnalyze={handleAnalyze}
        loading={loading}
        handleAddMemo={handleAddMemo}
        setShowGroupModal={setShowGroupModal}
        paperCount={papers.length}
      />

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <div
          ref={canvasRef}
          className="canvas-grid relative min-w-0 flex-1 overflow-hidden select-none"
          onMouseDown={handleCanvasMouseDown}
        >
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            }}
          >
            {groups.map((group) => (
              <GroupFrame
                key={group.id}
                group={group}
                dark={dark}
                zoom={zoom}
                onMouseDown={(e, id) => handleMouseDownItem(e, id, "group")}
                onResizeStart={handleResizeStart}
                onDeleteGroup={handleDeleteGroup}
              />
            ))}

            {memos.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                dark={dark}
                onMouseDown={(e, id) => handleMouseDownItem(e, id, "memo")}
                onUpdateText={(id, text) =>
                  setMemos((items) =>
                    items.map((item) =>
                      item.id === id ? { ...item, text } : item,
                    ),
                  )
                }
                onDeleteMemo={handleDeleteMemo}
                onChangeColor={(id, color) =>
                  setMemos((items) =>
                    items.map((item) =>
                      item.id === id ? { ...item, color } : item,
                    ),
                  )
                }
              />
            ))}

            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                selected={selectedPaper?.id === paper.id}
                dark={dark}
                zoom={zoom}
                onMouseDown={(e, id) => handleMouseDownItem(e, id, "paper")}
                onSelectPaper={setSelectedPaper}
                onDeletePaper={handleDeletePaper}
              />
            ))}
          </div>

          <div
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-md"
            style={{ backdropFilter: "blur(8px)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoom((value) => Math.max(0.25, value - 0.1))}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              aria-label="縮小"
            >
              <IC.Minus />
            </button>

            <input
              type="range"
              min={25}
              max={200}
              step={5}
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              className="zoom-slider h-1.5 w-28 cursor-pointer appearance-none rounded-full"
              aria-label="ズーム"
            />

            <button
              onClick={() => setZoom((value) => Math.min(2, value + 0.1))}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              aria-label="拡大"
            >
              <IC.Plus />
            </button>

            <span className="w-9 text-right text-[11px] font-semibold">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {selectedPaper && (
          <RightDrawer
            paper={selectedPaper}
            dark={dark}
            onClose={() => setSelectedPaper(null)}
          />
        )}
      </main>

      <HamburgerMenu
        showMenu={showMenu}
        dark={dark}
        setDark={setDark}
        zoom={zoom}
        setZoom={setZoom}
        onClose={() => setShowMenu(false)}
      />

      <GroupCreator
        show={showGroupModal}
        dark={dark}
        onClose={() => setShowGroupModal(false)}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
