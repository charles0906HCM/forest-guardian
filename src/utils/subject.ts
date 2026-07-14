import { getSubjectBg, OTHER_SUBJECT_ID } from "@/types";
import type { SubjectItem } from "@/types";
import { useAppStore } from "@/store/useAppStore";

export function useSubjectConfig() {
  const subjects = useAppStore((s) => s.subjects);

  const getSubjectById = (id: string): SubjectItem => {
    return (
      subjects.find((s) => s.id === id) ||
      subjects.find((s) => s.id === OTHER_SUBJECT_ID) ||
      subjects[0]
    );
  };

  const getSubjectColor = (id: string): string => {
    return getSubjectById(id).color;
  };

  const getSubjectStyle = (id: string) => {
    const subject = getSubjectById(id);
    return {
      color: subject.color,
      bg: getSubjectBg(subject.color),
      emoji: subject.emoji,
      label: subject.label,
    };
  };

  return {
    subjects,
    getSubjectById,
    getSubjectColor,
    getSubjectStyle,
  };
}
