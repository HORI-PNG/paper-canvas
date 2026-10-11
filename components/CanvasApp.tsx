"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "@/lib/canvas-api";
import { collectTags, matchMemo, matchPaper, normalize, parseQuery } from "@/lib/search";
import { createClient } from "@/lib/supabase/client";
import type {
  CardColor,
  Group,
  Memo,
  Paper,
  ResizeHandle,
} from "@/types/paper";
import { MEMO_COLORS } from "@/types/paper";
import { EmptyState } from "./EmptyState";
import { GroupCreator } from "./GroupCreator";
import { GroupFrame } from "./GroupFrame";
import { HamburgerMenu } from "./HamburgerMenu";
import { Header, type SaveState } from "./Header";
import { IC } from "./Icons";
import { MemoCard } from "./MemoCard";
import { useNotifications } from "./Notifications";
import { PaperCard, PendingPaperCard } from "./PaperCard";
import { RightDrawer } from "./RightDrawer";
import { SearchPanel } from "./SearchPanel";
import { SettingsModal } from "./SettingsModal";

export interface CurrentUser {
  id: string;
  email: string;
  createdAt: string;
}

interface CanvasAppProps {
  user: CurrentUser;
  initialDark: boolean;
  initialPapers: Paper[];
  initialMemos: Memo[];
  initialGroups: Group[];
}

type ItemType = "paper" | "memo" | "group";

/** キャンバスの表示状態。zoom と平行移動量はいつも一緒に変わるので1つにまとめる */
interface View {
  zoom: number;
  x: number;
  y: number;
}

/**
 * いま行っているマウス/タッチ操作。
 * 再描画のたびに値が変わる必要はないので useState ではなく useRef で持つ。
 * （useRef の値を変えても再描画は起きない。イベントリスナーから最新値を読める）
 */
type Interaction =
  | {
      kind: "drag";
      type: ItemType;
      id: string;
      startX: number;
      startY: number;
      grabX: number;
      grabY: number;
      last: { x: number; y: number } | null;
    }
  | {
      kind: "resize";
      id: string;
      handle: ResizeHandle;
      startX: number;
      startY: number;
      initial: Pick<Group, "x" | "y" | "width" | "height">;
      last: Pick<Group, "x" | "y" | "width" | "height"> | null;
    }
  | {
      kind: "pan";
      startX: number;
      startY: number;
      initialX: number;
      initialY: number;
    };

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const MIN_GROUP_SIZE = 120;
const PAPER_W = 268;
const PAPER_H = 260;
const TEXT_SAVE_DELAY = 600;
/** これ以上動いたら「クリック」ではなく「ドラッグ」とみなす距離(px) */
const DRAG_THRESHOLD = 3;

const clampZoom = (zoom: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

export function CanvasApp({
  user,
  initialDark,
  initialPapers,
  initialMemos,
  initialGroups,
}: CanvasAppProps) {
  const router = useRouter();
  const { notify } = useNotifications();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [dark, setDark] = useState(initialDark);
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [pending, setPending] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const [papers, setPapers] = useState(initialPapers);
  const [memos, setMemos] = useState(initialMemos);
  const [groups, setGroups] = useState(initialGroups);
  // 選択中の論文は「ID」で持つ。オブジェクトで持つと、メモや色を変えたときに古い内容が残ってしまう。
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPaper = papers.find((paper) => paper.id === selectedId) ?? null;

  const interaction = useRef<Interaction | null>(null);

  // ---- 検索・タグ絞り込み -------------------------------------------------
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // useMemo: papers が変わったときだけ集計し直す（ドラッグ中の再描画で毎回数え直さない）
  const tagCounts = useMemo(() => collectTags(papers), [papers]);
  // 論文を削除してタグが無くなった場合に備えて、存在するタグだけを有効にする
  const activeTags = selectedTags.filter((key) =>
    tagCounts.some((tag) => tag.key === key),
  );
  const terms = parseQuery(query);
  const filtering = terms.length > 0 || activeTags.length > 0;
  const matchedPapers = filtering
    ? papers.filter((paper) => matchPaper(paper, terms, activeTags))
    : null;
  const matchedPaperIds = new Set(matchedPapers?.map((paper) => paper.id));

  const toggleTag = (key: string) =>
    setSelectedTags((current) =>
      current.includes(key)
        ? current.filter((value) => value !== key)
        : [...current, key],
    );
  /** カードや詳細パネルのタグをクリックしたら、そのタグで絞り込む */
  const addTagFilter = (label: string) => {
    const key = normalize(label);
    setSelectedTags((current) =>
      current.includes(key) ? current : [...current, key],
    );
  };
  const clearSearch = () => {
    setQuery("");
    setSelectedTags([]);
  };

  // ---- 保存処理 ----------------------------------------------------------
  // 保存中の件数を数えて、ヘッダーに「保存中… / 保存済み」を表示する。
  const [savingCount, setSavingCount] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const saveState: SaveState =
    savingCount > 0 ? "saving" : saveError ? "error" : "saved";

  const persist = useCallback(
    async (task: () => Promise<unknown>, errorMessage: string) => {
      setSavingCount((count) => count + 1);
      try {
        await task();
        setSaveError(false);
        return true;
      } catch (error) {
        console.error(errorMessage, error);
        setSaveError(true);
        notify("error", `${errorMessage}。通信状況を確認してください。`);
        return false;
      } finally {
        setSavingCount((count) => count - 1);
      }
    },
    [notify],
  );

  // 文字入力のたびに保存すると通信が多すぎるので、入力が止まって 0.6 秒後に保存する（デバウンス）
  const textTimers = useRef(new Map<string, number>());
  const debouncedSave = useCallback(
    (key: string, task: () => Promise<unknown>, errorMessage: string) => {
      const timers = textTimers.current;
      window.clearTimeout(timers.get(key));
      timers.set(
        key,
        window.setTimeout(() => {
          timers.delete(key);
          persist(task, errorMessage);
        }, TEXT_SAVE_DELAY),
      );
    },
    [persist],
  );

  // 未保存の変更があるままタブを閉じようとしたら警告する
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (savingCount > 0 || textTimers.current.size > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [savingCount]);

  // ---- 座標変換 ----------------------------------------------------------
  /** 画面上の座標 (clientX/Y) → キャンバス上の座標 */
  const toCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const { zoom, x, y } = viewRef.current;
    return {
      x: (clientX - (rect?.left ?? 0) - x) / zoom,
      y: (clientY - (rect?.top ?? 0) - y) / zoom,
    };
  }, []);

  const canvasCenter = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return toCanvasPoint(
      (rect?.left ?? 0) + (rect?.width ?? window.innerWidth) / 2,
      (rect?.top ?? 0) + (rect?.height ?? window.innerHeight) / 2,
    );
  };

  /** 指定した画面上の点を中心にズームする（その点の下にあるものが動かないように） */
  const zoomAt = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = (clientX ?? rect.left + rect.width / 2) - rect.left;
      const py = (clientY ?? rect.top + rect.height / 2) - rect.top;

      setView((current) => {
        const zoom = clampZoom(nextZoom);
        const ratio = zoom / current.zoom;
        return {
          zoom,
          x: px - (px - current.x) * ratio,
          y: py - (py - current.y) * ratio,
        };
      });
    },
    [],
  );

  /** キャンバス上の点 (x, y) が画面中央に来るように移動する */
  const centerOn = (x: number, y: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setView((current) => ({
      ...current,
      x: rect.width / 2 - x * current.zoom,
      y: rect.height / 2 - y * current.zoom,
    }));
  };

  /** すべてのカード・メモ・グループが画面に収まるように表示を合わせる */
  const fitAll = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const boxes = [
      ...papers.map((p) => ({ x: p.x, y: p.y, w: PAPER_W, h: PAPER_H })),
      ...memos.map((m) => ({ x: m.x, y: m.y, w: 208, h: 160 })),
      ...groups.map((g) => ({ x: g.x, y: g.y - 30, w: g.width, h: g.height + 30 })),
    ];
    if (!rect || boxes.length === 0) {
      setView({ zoom: 1, x: 0, y: 0 });
      return;
    }
    const minX = Math.min(...boxes.map((b) => b.x));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxX = Math.max(...boxes.map((b) => b.x + b.w));
    const maxY = Math.max(...boxes.map((b) => b.y + b.h));
    const padding = 48;
    const zoom = clampZoom(
      Math.min(
        (rect.width - padding * 2) / (maxX - minX),
        (rect.height - padding * 2) / (maxY - minY),
        1,
      ),
    );
    setView({
      zoom,
      x: (rect.width - (maxX - minX) * zoom) / 2 - minX * zoom,
      y: (rect.height - (maxY - minY) * zoom) / 2 - minY * zoom,
    });
  };

  // ---- ドラッグ・リサイズ・パン ------------------------------------------
  const handleItemPointerDown = (
    e: React.PointerEvent,
    id: string,
    type: ItemType,
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const item =
      type === "paper"
        ? papers.find((value) => value.id === id)
        : type === "memo"
          ? memos.find((value) => value.id === id)
          : groups.find((value) => value.id === id);
    if (!item) return;

    // 「カードのどこを掴んだか」を覚えておき、動かしても掴んだ位置がずれないようにする
    const point = toCanvasPoint(e.clientX, e.clientY);
    interaction.current = {
      kind: "drag",
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      grabX: point.x - item.x,
      grabY: point.y - item.y,
      last: null,
    };
  };

  const handleResizeStart = (
    e: React.PointerEvent,
    id: string,
    handle: ResizeHandle,
  ) => {
    e.stopPropagation();
    const group = groups.find((item) => item.id === id);
    if (!group) return;

    interaction.current = {
      kind: "resize",
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initial: {
        x: group.x,
        y: group.y,
        width: group.width,
        height: group.height,
      },
      last: null,
    };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    setSelectedId(null);
    interaction.current = {
      kind: "pan",
      startX: e.clientX,
      startY: e.clientY,
      initialX: viewRef.current.x,
      initialY: viewRef.current.y,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const current = interaction.current;
      if (!current) return;

      if (current.kind === "drag") {
        // 手ぶれ程度の小さな動きはドラッグとして扱わない（タップで詳細を開けるように）
        if (
          !current.last &&
          Math.hypot(e.clientX - current.startX, e.clientY - current.startY) <
            DRAG_THRESHOLD
        ) {
          return;
        }
        const point = toCanvasPoint(e.clientX, e.clientY);
        const x = Math.round(point.x - current.grabX);
        const y = Math.round(point.y - current.grabY);
        current.last = { x, y };

        const move = <T extends { id: string; x: number; y: number }>(
          items: T[],
        ) =>
          items.map((item) =>
            item.id === current.id ? { ...item, x, y } : item,
          );
        if (current.type === "paper") setPapers(move);
        else if (current.type === "memo") setMemos(move);
        else setGroups(move);
        return;
      }

      if (current.kind === "resize") {
        const { zoom } = viewRef.current;
        const dx = (e.clientX - current.startX) / zoom;
        const dy = (e.clientY - current.startY) / zoom;
        const { initial, handle } = current;
        let { x, y, width, height } = initial;

        // ハンドル名に e(東)/w(西)/s(南)/n(北) が含まれるかで、どの辺を動かすか決める
        if (handle.includes("e")) width = Math.max(MIN_GROUP_SIZE, initial.width + dx);
        if (handle.includes("s")) height = Math.max(MIN_GROUP_SIZE, initial.height + dy);
        if (handle.includes("w")) {
          width = Math.max(MIN_GROUP_SIZE, initial.width - dx);
          x = initial.x + initial.width - width;
        }
        if (handle.includes("n")) {
          height = Math.max(MIN_GROUP_SIZE, initial.height - dy);
          y = initial.y + initial.height - height;
        }

        const next = {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        };
        current.last = next;
        setGroups((items) =>
          items.map((group) =>
            group.id === current.id ? { ...group, ...next } : group,
          ),
        );
        return;
      }

      setView((view) => ({
        ...view,
        x: current.initialX + e.clientX - current.startX,
        y: current.initialY + e.clientY - current.startY,
      }));
    };

    // 操作が終わったタイミングで、動かした結果だけを DB に保存する
    const handlePointerUp = () => {
      const current = interaction.current;
      interaction.current = null;
      if (!current || current.kind === "pan") return;

      // 動かさずに離した = クリック。論文なら詳細パネルを開く
      if (current.kind === "drag" && !current.last) {
        if (current.type === "paper") setSelectedId(current.id);
        return;
      }
      if (!current.last) return;

      if (current.kind === "resize") {
        const geometry = current.last;
        persist(
          () => api.updateGroup(current.id, geometry),
          "グループの保存に失敗しました",
        );
        return;
      }

      const position = current.last;
      const save =
        current.type === "paper"
          ? () => api.updatePaper(current.id, position)
          : current.type === "memo"
            ? () => api.updateMemo(current.id, position)
            : () => api.updateGroup(current.id, position);
      persist(save, "位置の保存に失敗しました");
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [toCanvasPoint, persist]);

  // ホイール: 通常はスクロール(パン)、Ctrl/⌘ + ホイール（トラックパッドのピンチ）でズーム
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      // メモの入力欄など、スクロールできる要素の上では通常のスクロールを優先
      if ((e.target as HTMLElement).closest("textarea")) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(viewRef.current.zoom * Math.exp(-e.deltaY * 0.0025), e.clientX, e.clientY);
      } else {
        setView((current) => ({
          ...current,
          x: current.x - e.deltaX,
          y: current.y - e.deltaY,
        }));
      }
    };

    // passive: false にしないと preventDefault() でブラウザ自体のズームを止められない
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  // ショートカット: "/" または Ctrl(⌘)+K で検索欄へ、Esc でパネル類を閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (
        (e.key === "/" && !typing) ||
        (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.key !== "Escape") return;
      setShowMenu(false);
      setSelectedId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ---- 論文 --------------------------------------------------------------
  const handleAnalyze = async (rawUrl?: string) => {
    const url = (rawUrl ?? urlInput).trim();
    if (!url || pending) return;

    const center = canvasCenter();
    let position = {
      x: Math.round(center.x - PAPER_W / 2),
      y: Math.round(center.y - PAPER_H / 2),
    };
    // 既存のカードとほぼ同じ位置なら、右下に少しずつずらして重なりを避ける
    for (
      let i = 0;
      i < 20 &&
      papers.some(
        (paper) =>
          Math.abs(paper.x - position.x) < 40 &&
          Math.abs(paper.y - position.y) < 40,
      );
      i++
    ) {
      position = { x: position.x + 36, y: position.y + 36 };
    }
    setPending(position);

    try {
      const { ok, status, body } = await api.addPaper(url, position.x, position.y);

      if (status === 409 && body.paper) {
        const existing = body.paper;
        setSelectedId(existing.id);
        centerOn(existing.x + PAPER_W / 2, existing.y + PAPER_H / 2);
        setUrlInput("");
        notify("info", "この論文はすでにキャンバスにあります");
        return;
      }

      if (!ok || !body.paper) {
        if (status === 401) {
          router.replace("/login");
          return;
        }
        notify("error", body.error ?? "論文の解析に失敗しました");
        return;
      }

      const paper = body.paper;
      setPapers((items) => [...items, paper]);
      setSelectedId(paper.id);
      setUrlInput("");
      notify("success", `「${paper.title}」を追加しました`);
    } catch (error) {
      console.error(error);
      notify("error", "サーバーに接続できませんでした。通信状況を確認してください");
    } finally {
      setPending(null);
    }
  };

  const handleUpdatePaper = (
    id: string,
    patch: Partial<Pick<Paper, "color" | "pdfPath">>,
  ) => {
    setPapers((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    if (patch.color) {
      persist(() => api.updatePaper(id, { color: patch.color as CardColor }), "色の保存に失敗しました");
    }
  };

  const handleNoteChange = (id: string, note: string) => {
    setPapers((items) =>
      items.map((item) => (item.id === id ? { ...item, note } : item)),
    );
    debouncedSave(`note:${id}`, () => api.updatePaper(id, { note }), "メモの保存に失敗しました");
  };

  const handleDeletePaper = async (paper: Paper) => {
    const ok = window.confirm(
      `「${paper.title}」をキャンバスから削除しますか？\n個人メモと添付PDFも削除されます。`,
    );
    if (!ok) return;

    window.clearTimeout(textTimers.current.get(`note:${paper.id}`));
    textTimers.current.delete(`note:${paper.id}`);

    // 楽観的更新: 先に画面から消し、失敗したら元に戻す（体感速度が上がる）
    setPapers((items) => items.filter((item) => item.id !== paper.id));
    setSelectedId((id) => (id === paper.id ? null : id));
    const success = await persist(() => api.deletePaper(paper), "論文の削除に失敗しました");
    if (!success) setPapers((items) => [...items, paper]);
  };

  // ---- メモ --------------------------------------------------------------
  const handleAddMemo = () => {
    const center = canvasCenter();
    const memo: Memo = {
      // ID をブラウザ側で作ると、DB の応答を待たずに画面に出せる
      id: crypto.randomUUID(),
      text: "",
      x: Math.round(center.x - 104),
      y: Math.round(center.y - 80),
      color: MEMO_COLORS[memos.length % MEMO_COLORS.length],
      createdDate: new Date().toISOString().slice(0, 10),
    };
    setMemos((items) => [...items, memo]);
    persist(() => api.createMemo(memo), "メモの作成に失敗しました").then(
      (success) => {
        if (!success) setMemos((items) => items.filter((item) => item.id !== memo.id));
      },
    );
  };

  const handleMemoText = (id: string, text: string) => {
    setMemos((items) =>
      items.map((item) => (item.id === id ? { ...item, text } : item)),
    );
    debouncedSave(`memo:${id}`, () => api.updateMemo(id, { text }), "メモの保存に失敗しました");
  };

  const handleMemoColor = (id: string, color: Memo["color"]) => {
    setMemos((items) =>
      items.map((item) => (item.id === id ? { ...item, color } : item)),
    );
    persist(() => api.updateMemo(id, { color }), "メモの保存に失敗しました");
  };

  const handleDeleteMemo = async (id: string) => {
    const memo = memos.find((item) => item.id === id);
    if (!memo) return;
    if (memo.text.trim() && !window.confirm("このメモを削除しますか？")) return;

    window.clearTimeout(textTimers.current.get(`memo:${id}`));
    textTimers.current.delete(`memo:${id}`);
    setMemos((items) => items.filter((item) => item.id !== id));
    const success = await persist(() => api.deleteMemo(id), "メモの削除に失敗しました");
    if (!success) setMemos((items) => [...items, memo]);
  };

  // ---- グループ ----------------------------------------------------------
  const handleCreateGroup = (
    label: string,
    bgColor: string,
    borderColor: string,
  ) => {
    const center = canvasCenter();
    const group: Group = {
      id: crypto.randomUUID(),
      label,
      x: Math.round(center.x - 240),
      y: Math.round(center.y - 140),
      width: 480,
      height: 280,
      bgColor,
      borderColor,
    };
    setGroups((items) => [...items, group]);
    persist(() => api.createGroup(group), "グループの作成に失敗しました").then(
      (success) => {
        if (!success) setGroups((items) => items.filter((item) => item.id !== group.id));
      },
    );
  };

  const handleRenameGroup = (id: string, label: string) => {
    setGroups((items) =>
      items.map((item) => (item.id === id ? { ...item, label } : item)),
    );
    persist(() => api.updateGroup(id, { label }), "グループ名の保存に失敗しました");
  };

  const handleDeleteGroup = async (id: string) => {
    const group = groups.find((item) => item.id === id);
    if (!group) return;
    if (!window.confirm(`グループ「${group.label}」を削除しますか？\n中の論文やメモは削除されません。`)) return;

    setGroups((items) => items.filter((item) => item.id !== id));
    const success = await persist(() => api.deleteGroup(id), "グループの削除に失敗しました");
    if (!success) setGroups((items) => [...items, group]);
  };

  // ---- その他 ------------------------------------------------------------
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    // サーバーが次回の表示で読めるように Cookie に保存（1年間）
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const isEmpty =
    papers.length === 0 && memos.length === 0 && groups.length === 0 && !pending;

  return (
    <div
      className="flex h-dvh w-screen flex-col overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <Header
        dark={dark}
        onToggleDark={toggleDark}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        handleAnalyze={() => handleAnalyze()}
        loading={pending !== null}
        handleAddMemo={handleAddMemo}
        setShowGroupModal={setShowGroupModal}
        paperCount={papers.length}
        saveState={saveState}
      />

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div
          ref={canvasRef}
          className="canvas-grid relative min-w-0 flex-1 touch-none overflow-hidden select-none"
          style={{
            backgroundPosition: `${view.x}px ${view.y}px`,
            backgroundSize: `${28 * view.zoom}px ${28 * view.zoom}px`,
          }}
          onPointerDown={handleCanvasPointerDown}
        >
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
            }}
          >
            {groups.map((group) => (
              <GroupFrame
                key={group.id}
                group={group}
                onPointerDown={(e, id) => handleItemPointerDown(e, id, "group")}
                onResizeStart={handleResizeStart}
                onRename={handleRenameGroup}
                onDelete={handleDeleteGroup}
              />
            ))}

            {memos.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                dimmed={filtering && !matchMemo(memo, terms, activeTags)}
                onPointerDown={(e, id) => handleItemPointerDown(e, id, "memo")}
                onUpdateText={handleMemoText}
                onDeleteMemo={handleDeleteMemo}
                onChangeColor={handleMemoColor}
              />
            ))}

            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                selected={selectedId === paper.id}
                dimmed={filtering && !matchedPaperIds.has(paper.id)}
                onTagClick={addTagFilter}
                onPointerDown={(e, id) => handleItemPointerDown(e, id, "paper")}
                onSelectPaper={(p) => setSelectedId(p.id)}
                onDeletePaper={handleDeletePaper}
              />
            ))}

            {pending && <PendingPaperCard x={pending.x} y={pending.y} />}
          </div>

          {!isEmpty && (
            <SearchPanel
              ref={searchRef}
              query={query}
              onQueryChange={setQuery}
              tags={tagCounts}
              selectedTags={activeTags}
              onToggleTag={toggleTag}
              onClear={clearSearch}
              results={matchedPapers}
              totalPapers={papers.length}
              onJump={(paper) => {
                setSelectedId(paper.id);
                centerOn(paper.x + PAPER_W / 2, paper.y + PAPER_H / 2);
              }}
            />
          )}

          {isEmpty && (
            <EmptyState
              onTrySample={() =>
                handleAnalyze("https://arxiv.org/abs/1706.03762")
              }
            />
          )}

          <div
            className="absolute right-4 bottom-4 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-md"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={fitAll}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              aria-label="全体を表示"
              title="全体を表示"
            >
              <IC.Target />
            </button>

            <button
              onClick={() => zoomAt(view.zoom - 0.1)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              aria-label="縮小"
            >
              <IC.Minus />
            </button>

            <input
              type="range"
              min={MIN_ZOOM * 100}
              max={MAX_ZOOM * 100}
              step={5}
              value={Math.round(view.zoom * 100)}
              onChange={(e) => zoomAt(Number(e.target.value) / 100)}
              className="zoom-slider hidden h-1.5 w-28 cursor-pointer appearance-none rounded-full sm:block"
              aria-label="ズーム"
            />

            <button
              onClick={() => zoomAt(view.zoom + 0.1)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              aria-label="拡大"
            >
              <IC.Plus />
            </button>

            <button
              onClick={() => zoomAt(1)}
              className="w-10 text-right text-[11px] font-semibold text-[var(--foreground)]"
              title="100% に戻す"
            >
              {Math.round(view.zoom * 100)}%
            </button>
          </div>
        </div>

        {selectedPaper && (
          <RightDrawer
            key={selectedPaper.id}
            paper={selectedPaper}
            userId={user.id}
            onClose={() => setSelectedId(null)}
            onUpdate={handleUpdatePaper}
            onNoteChange={handleNoteChange}
            onDelete={handleDeletePaper}
            onTagClick={addTagFilter}
          />
        )}
      </main>

      {showMenu && (
        <HamburgerMenu
          user={user}
          counts={{ papers: papers.length, memos: memos.length, groups: groups.length }}
          onOpenSettings={() => {
            setShowMenu(false);
            setShowSettings(true);
          }}
          onLogout={handleLogout}
          onClose={() => setShowMenu(false)}
        />
      )}

      {showGroupModal && (
        <GroupCreator
          onClose={() => setShowGroupModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {showSettings && (
        <SettingsModal
          email={user.email}
          dark={dark}
          onToggleDark={toggleDark}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
