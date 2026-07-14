import { useState } from "react";
import { X, Plus, Pencil, Trash2, Check } from "lucide-react";
import { clsx } from "clsx";
import {
  SUBJECT_COLOR_PRESETS,
  SUBJECT_EMOJI_PRESETS,
  type SubjectItem,
  getSubjectBg,
} from "@/types";
import { useAppStore } from "@/store/useAppStore";

interface SubjectManagerModalProps {
  open: boolean;
  onClose: () => void;
}

type EditingSubject = SubjectItem | null;

export default function SubjectManagerModal({ open, onClose }: SubjectManagerModalProps) {
  const subjects = useAppStore((s) => s.subjects);
  const addSubject = useAppStore((s) => s.addSubject);
  const updateSubject = useAppStore((s) => s.updateSubject);
  const deleteSubject = useAppStore((s) => s.deleteSubject);

  const [editingSubject, setEditingSubject] = useState<EditingSubject>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(SUBJECT_COLOR_PRESETS[0]);
  const [newEmoji, setNewEmoji] = useState(SUBJECT_EMOJI_PRESETS[0]);

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewLabel("");
    setNewColor(SUBJECT_COLOR_PRESETS[0]);
    setNewEmoji(SUBJECT_EMOJI_PRESETS[0]);
    setEditingSubject(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewLabel("");
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addSubject({
      label: newLabel.trim(),
      color: newColor,
      emoji: newEmoji,
    });
    setIsAdding(false);
    setNewLabel("");
  };

  const handleStartEdit = (subject: SubjectItem) => {
    setEditingSubject({ ...subject });
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (!editingSubject) return;
    updateSubject(editingSubject.id, {
      label: editingSubject.label,
      color: editingSubject.color,
      emoji: editingSubject.emoji,
    });
    setEditingSubject(null);
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
  };

  const handleDelete = (subject: SubjectItem) => {
    if (subject.isBuiltIn) return;
    if (confirm(`确定删除学科「${subject.label}」吗？使用该学科的任务将迁移到「其他」分类。`)) {
      deleteSubject(subject.id);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-forest-deep/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative glass-card w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 md:p-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-forest-deep">
            📚 学科管理
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/50 flex items-center justify-center text-forest-bark hover:text-forest-deep"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => {
            const isEditing = editingSubject?.id === subject.id;
            const bg = getSubjectBg(subject.color);

            if (isEditing) {
              return (
                <div
                  key={subject.id}
                  className="p-4 rounded-2xl border-2"
                  style={{ borderColor: subject.color, background: bg }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: "rgba(255,255,255,0.6)" }}
                    >
                      {editingSubject!.emoji}
                    </div>
                    <input
                      type="text"
                      value={editingSubject!.label}
                      onChange={(e) =>
                        setEditingSubject({ ...editingSubject!, label: e.target.value })
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-white/60 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 font-medium text-forest-deep"
                      placeholder="学科名称"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-sm font-medium text-forest-deep mb-2 block">选择图标</label>
                    <div className="grid grid-cols-8 gap-2">
                      {SUBJECT_EMOJI_PRESETS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() =>
                            setEditingSubject({ ...editingSubject!, emoji })
                          }
                          className={clsx(
                            "w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all",
                            editingSubject!.emoji === emoji
                              ? "bg-white shadow-md scale-110"
                              : "bg-white/40 hover:bg-white/60"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-sm font-medium text-forest-deep mb-2 block">选择颜色</label>
                    <div className="grid grid-cols-6 gap-2">
                      {SUBJECT_COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            setEditingSubject({ ...editingSubject!, color })
                          }
                          className={clsx(
                            "w-9 h-9 rounded-lg transition-all flex items-center justify-center",
                            editingSubject!.color === color
                              ? "ring-2 ring-offset-2 ring-forest-mid scale-110"
                              : "hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        >
                          {editingSubject!.color === color && (
                            <Check size={16} className="text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 glass-btn"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 btn-primary dew-hover"
                    >
                      保存
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={subject.id}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-white/40"
                style={{ borderLeft: `4px solid ${subject.color}`, background: bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.6)" }}
                >
                  {subject.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-forest-deep">{subject.label}</span>
                  {subject.isBuiltIn && (
                    <span className="ml-2 text-xs text-forest-bark bg-white/50 px-2 py-0.5 rounded-full">
                      内置
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(subject)}
                    className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center text-forest-bark hover:text-forest-deep transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {!subject.isBuiltIn && (
                    <button
                      onClick={() => handleDelete(subject)}
                      className="w-8 h-8 rounded-lg hover:bg-berry-red/20 flex items-center justify-center text-forest-bark hover:text-berry-red transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isAdding && (
            <div
              className="p-4 rounded-2xl border-2 border-dashed"
              style={{ borderColor: newColor, background: getSubjectBg(newColor) }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: "rgba(255,255,255,0.6)" }}
                >
                  {newEmoji}
                </div>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/60 border border-white/60 focus:outline-none focus:ring-2 focus:ring-forest-light/30 font-medium text-forest-deep"
                  placeholder="输入学科名称"
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="text-sm font-medium text-forest-deep mb-2 block">选择图标</label>
                <div className="grid grid-cols-8 gap-2">
                  {SUBJECT_EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewEmoji(emoji)}
                      className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all",
                        newEmoji === emoji
                          ? "bg-white shadow-md scale-110"
                          : "bg-white/40 hover:bg-white/60"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-sm font-medium text-forest-deep mb-2 block">选择颜色</label>
                <div className="grid grid-cols-6 gap-2">
                  {SUBJECT_COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={clsx(
                        "w-9 h-9 rounded-lg transition-all flex items-center justify-center",
                        newColor === color
                          ? "ring-2 ring-offset-2 ring-forest-mid scale-110"
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {newColor === color && (
                        <Check size={16} className="text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancelAdd}
                  className="flex-1 glass-btn"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newLabel.trim()}
                  className={clsx(
                    "flex-1 btn-primary dew-hover",
                    !newLabel.trim() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  添加
                </button>
              </div>
            </div>
          )}

          {!isAdding && (
            <button
              onClick={handleStartAdd}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-white/60 text-forest-bark hover:text-forest-deep hover:border-forest-mid/50 hover:bg-white/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>添加新学科</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
