import { useCallback, useState } from "react";

const useLazyTabs = ({ initialIndex = 0, lazyIndexes = [] }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [visitedIndexes, setVisitedIndexes] = useState(() => new Set());

  const onTabChange = useCallback((_, data) => {
    const index = data.activeIndex;

    setActiveIndex(index);

    if (lazyIndexes.includes(index)) {
      setVisitedIndexes((prev) => {
        if (prev.has(index)) return prev;
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    }
  }, [lazyIndexes]);

  const hasVisited = useCallback(
    (index) => visitedIndexes.has(index),
    [visitedIndexes]
  );

  return {
    activeIndex,
    onTabChange,
    hasVisited,
  };
}

export default useLazyTabs;