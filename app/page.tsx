"use client";

import React, { useState, useRef, useCallback } from "react";
import { Paper, Memo, Group, ResizeHandle } from "@/types/paper";
import { Header } from "@/components/Header";
import { PaperCard } from "@/components/PaperCard";
import { MemoCard } from "@/components/MemoCard";
import { GroupFrame } from "@/components/GroupFrame";
import { RightDrawer } from "@/components/RightDrawer";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { GroupCreator } from "@/components/GroupCreator";

const INITIAL_PAPERS: Paper[] = [
  {
    id: "p1",
    title: "Attention Is All You Need",
    authors: ["A. Vaswani", "N. Shazeer", "N. Parmar", "J. Uszkoreit"],
    year: 2017,
    bullets: [
      "Transformerアーキテクチャの提案",
      "Self-Attentionのみで配列変換を実現",
      "学習速度の大幅な向上と高い並列化",
    ],
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    tags: ["Transformer", "Attention", "NLP"],
    url: "https://arxiv.org/abs/1706.03762",
    createdDate: "2025/01/10",
    x: 80,
    y: 120,
    color: "sky",
  },
  {
    id: "p2",
    title:
      "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: ["J. Devlin", "M. Chang", "K. Lee", "K. Toutanova"],
    year: 2018,
    bullets: [
      "双方向のコンテキストを学習する事前学習手法",
      "Masked Language Model (MLM) の導入",
      "多くの11のNLPタスクでSOTAを達成",
    ],
    abstract:
      "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
    tags: ["BERT", "Pre-training", "NLP"],
    url: "https://arxiv.org/abs/1810.04805",
    createdDate: "2025/01/12",
    x: 460,
    y: 120,
    color: "indigo",
  },
  {
    id: "p3",
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    authors: ["E. Hu", "Y. Shen", "P. Wallis", "Z. Allen-Zhu"],
    year: 2021,
    bullets: [
      "重み行列を低ランク分解してファインチューニング",
      "学習パラメータ数を大幅に削減（1/10000以下）",
      "推論レイテンシを増やさずに同等の性能を維持",
    ],
    abstract:
      "An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning becomes less feasible. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture.",
    tags: ["LoRA", "PEFT", "LLM"],
    url: "https://arxiv.org/abs/2106.09685",
    createdDate: "2025/01/14",
    x: 270,
    y: 450,
    color: "emerald",
  },
];

const INITIAL_MEMOS: Memo[] = [
  {
    id: "m1",
    text: "LoRAとQLoRAの違いについて実験結果を比較しておくこと。",
    x: 620,
    y: 450,
    color: "yellow",
    createdDate: "2025/01/15",
  },
];

const INITIAL_GROUPS: Group[] = [
  {
    id: "g1",
    label: "言語モデル基礎（Transformer / BERT）",
    x: 60,
    y: 80,
    width: 740,
    height: 340,
    bgColor: "rgba(224,242,254,0.3)",
    borderColor: "#0284c7",
  },
];

export default function Home() {
  const [dark, setDark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [papers, setPapers] = useState<Paper[]>(INITIAL_PAPERS);
  const [memos, setMemos] = useState<Memo[]>(INITIAL_MEMOS);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);

  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

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

  // 論文追加時の自動選択・中央追加
  const handleAnalyze = () => {
    if (!urlInput.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const newPaper: Paper = {
        id: `p_${Date.now()}`,
        title: "新規解析論文: " + urlInput,
        authors: ["研究グループ"],
        year: 2025,
        bullets: ["抽出されたキーポイント1", "抽出されたキーポイント2"],
        abstract:
          "自動生成された論文の概要テキストです。詳細ボタンからarXivで確認できます。",
        tags: ["New", "Analysis"],
        url: urlInput,
        createdDate: new Date().toLocaleDateString(),
        x: 200,
        y: 200,
        color: "violet",
      };
      setPapers((prev) => [...prev, newPaper]);
      setSelectedPaper(newPaper);
      setUrlInput("");
      setLoading(false);
    }, 1000);
  };

  const handleAddMemo = () => {
    const newMemo: Memo = {
      id: `m_${Date.now()}`,
      text: "",
      x: 200,
      y: 200,
      color: "yellow",
      createdDate: new Date().toLocaleDateString(),
    };
    setMemos((prev) => [...prev, newMemo]);
  };

  const handleCreateGroup = (
    label: string,
    bgColor: string,
    borderColor: string,
  ) => {
    const newGroup: Group = {
      id: `g_${Date.now()}`,
      label,
      x: 150,
      y: 150,
      width: 420,
      height: 320,
      bgColor,
      borderColor,
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  const handleDeletePaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPapers((prev) => prev.filter((p) => p.id !== id));
    if (selectedPaper?.id === id) setSelectedPaper(null);
  };

  const handleDeleteMemo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemos((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeleteGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  // ドラッグ操作関連
  const handleMouseDownItem = (
    e: React.MouseEvent,
    id: string,
    type: "paper" | "memo" | "group",
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (type === "paper") {
      const p = papers.find((item) => item.id === id);
      if (p) setSelectedPaper(p);
    }

    let itemX = 0;
    let itemY = 0;

    if (type === "paper") {
      const p = papers.find((item) => item.id === id);
      if (p) {
        itemX = p.x;
        itemY = p.y;
      }
    } else if (type === "memo") {
      const m = memos.find((item) => item.id === id);
      if (m) {
        itemX = m.x;
        itemY = m.y;
      }
    } else if (type === "group") {
      const g = groups.find((item) => item.id === id);
      if (g) {
        itemX = g.x;
        itemY = g.y;
      }
    }

    setDragTarget({
      id,
      type,
      offsetX: e.clientX / zoom - itemX,
      offsetY: e.clientY / zoom - itemY,
    });
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    id: string,
    handle: ResizeHandle,
  ) => {
    e.stopPropagation();
    const g = groups.find((item) => item.id === id);
    if (!g) return;

    setResizeTarget({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: g.x,
      initialY: g.y,
      initialW: g.width,
      initialH: g.height,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragTarget) {
        const currentX = e.clientX / zoom - dragTarget.offsetX;
        const currentY = e.clientY / zoom - dragTarget.offsetY;

        if (dragTarget.type === "paper") {
          setPapers((prev) =>
            prev.map((p) =>
              p.id === dragTarget.id ? { ...p, x: currentX, y: currentY } : p,
            ),
          );
        } else if (dragTarget.type === "memo") {
          setMemos((prev) =>
            prev.map((m) =>
              m.id === dragTarget.id ? { ...m, x: currentX, y: currentY } : m,
            ),
          );
        } else if (dragTarget.type === "group") {
          setGroups((prev) =>
            prev.map((g) =>
              g.id === dragTarget.id ? { ...g, x: currentX, y: currentY } : g,
            ),
          );
        }
      }

      if (resizeTarget) {
        const dx = (e.clientX - resizeTarget.startX) / zoom;
        const dy = (e.clientY - resizeTarget.startY) / zoom;

        setGroups((prev) =>
          prev.map((g) => {
            if (g.id !== resizeTarget.id) return g;

            let newX = resizeTarget.initialX;
            let newY = resizeTarget.initialY;
            let newW = resizeTarget.initialW;
            let newH = resizeTarget.initialH;

            const h = resizeTarget.handle;
            if (h.includes("e"))
              newW = Math.max(150, resizeTarget.initialW + dx);
            if (h.includes("s"))
              newH = Math.max(100, resizeTarget.initialH + dy);
            if (h.includes("w")) {
              const possibleW = resizeTarget.initialW - dx;
              if (possibleW > 150) {
                newW = possibleW;
                newX = resizeTarget.initialX + dx;
              }
            }
            if (h.includes("n")) {
              const possibleH = resizeTarget.initialH - dy;
              if (possibleH > 100) {
                newH = possibleH;
                newY = resizeTarget.initialY + dy;
              }
            }

            return { ...g, x: newX, y: newY, width: newW, height: newH };
          }),
        );
      }
    },
    [dragTarget, resizeTarget, zoom],
  );

  const handleMouseUp = () => {
    setDragTarget(null);
    setResizeTarget(null);
  };

  // 空白背景クリック時に選択解除
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedPaper(null);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden ${dark ? "dark bg-[#111318]" : "bg-gray-50"}`}
    >
      {/* 1. ヘッダー（固定） */}
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

      {/* 2. キャンバス（ヘッダーの高さを考慮したpt-16） */}
      <div
        className="flex-1 relative overflow-hidden canvas-grid select-none pt-16"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75 pt-16"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* グループ枠 */}
          {groups.map((g) => (
            <GroupFrame
              key={g.id}
              group={g}
              dark={dark}
              zoom={zoom}
              onMouseDown={(e, id) => handleMouseDownItem(e, id, "group")}
              onResizeStart={handleResizeStart}
              onDeleteGroup={handleDeleteGroup}
            />
          ))}

          {/* 付箋メモ */}
          {memos.map((m) => (
            <MemoCard
              key={m.id}
              memo={m}
              dark={dark}
              onMouseDown={(e, id) => handleMouseDownItem(e, id, "memo")}
              onUpdateText={(id, text) =>
                setMemos((prev) =>
                  prev.map((item) =>
                    item.id === id ? { ...item, text } : item,
                  ),
                )
              }
              onDeleteMemo={handleDeleteMemo}
              onChangeColor={(id, color) =>
                setMemos((prev) =>
                  prev.map((item) =>
                    item.id === id ? { ...item, color } : item,
                  ),
                )
              }
            />
          ))}

          {/* 論文カード */}
          {papers.map((p) => (
            <PaperCard
              key={p.id}
              paper={p}
              selected={selectedPaper?.id === p.id}
              dark={dark}
              zoom={zoom}
              onMouseDown={(e, id) => handleMouseDownItem(e, id, "paper")}
              onSelectPaper={(paper) => setSelectedPaper(paper)}
              onDeletePaper={handleDeletePaper}
            />
          ))}
        </div>
      </div>

      {/* 3. モーダル・ドロワー */}
      <RightDrawer
        paper={selectedPaper}
        dark={dark}
        onClose={() => setSelectedPaper(null)}
      />

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
