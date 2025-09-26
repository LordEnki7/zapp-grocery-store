import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  totalItems: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

export const useVirtualization = ({
  itemHeight,
  containerHeight,
  overscan = 5,
  totalItems
}: VirtualizationOptions) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      totalItems - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(totalItems - 1, endIndex + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, totalItems]);

  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      items.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight
      });
    }
    return items;
  }, [visibleRange, itemHeight]);

  const totalHeight = totalItems * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    virtualItems,
    totalHeight,
    handleScroll,
    visibleRange
  };
};

// Hook for grid virtualization (2D)
interface GridVirtualizationOptions {
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  totalItems: number;
  gap?: number;
  overscan?: number;
}

export const useGridVirtualization = ({
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  totalItems,
  gap = 0,
  overscan = 5
}: GridVirtualizationOptions) => {
  const [scrollTop, setScrollTop] = useState(0);

  // Ensure valid dimensions to prevent Infinity calculations
  const safeItemWidth = Math.max(itemWidth, 1);
  const safeItemHeight = Math.max(itemHeight, 1);
  const safeContainerWidth = Math.max(containerWidth, 1);
  const safeContainerHeight = Math.max(containerHeight, 1);
  const safeGap = Math.max(gap, 0);

  const columnsPerRow = Math.max(1, Math.floor(safeContainerWidth / (safeItemWidth + safeGap)));
  const totalRows = Math.max(0, Math.ceil(totalItems / columnsPerRow));

  const visibleRange = useMemo(() => {
    const rowHeight = safeItemHeight + safeGap;
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      startRow + Math.ceil(safeContainerHeight / rowHeight),
      totalRows - 1
    );

    return {
      startRow: Math.max(0, startRow - overscan),
      endRow: Math.min(totalRows - 1, endRow + overscan),
      startIndex: Math.max(0, (startRow - overscan) * columnsPerRow),
      endIndex: Math.min(totalItems - 1, (endRow + overscan + 1) * columnsPerRow - 1)
    };
  }, [scrollTop, safeItemHeight, safeContainerHeight, safeGap, totalRows, columnsPerRow, totalItems, overscan]);

  const virtualItems = useMemo(() => {
    const items: Array<VirtualItem & { row: number; col: number; x: number; y: number }> = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex && i < totalItems; i++) {
      const row = Math.floor(i / columnsPerRow);
      const col = i % columnsPerRow;
      
      items.push({
        index: i,
        row,
        col,
        start: row * (safeItemHeight + safeGap),
        end: (row + 1) * (safeItemHeight + safeGap),
        x: col * (safeItemWidth + safeGap),
        y: row * (safeItemHeight + safeGap)
      });
    }
    
    return items;
  }, [visibleRange, safeItemHeight, safeItemWidth, safeGap, columnsPerRow, totalItems]);

  const totalHeight = Math.max(0, totalRows * (safeItemHeight + safeGap));

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    virtualItems,
    totalHeight,
    handleScroll,
    visibleRange,
    columnsPerRow
  };
};

// Hook for infinite scrolling with virtualization
interface InfiniteScrollOptions {
  itemHeight: number;
  containerHeight: number;
  loadMore: () => Promise<void>;
  hasNextPage: boolean;
  isLoading: boolean;
  threshold?: number;
}

export const useInfiniteScroll = ({
  itemHeight,
  containerHeight,
  loadMore,
  hasNextPage,
  isLoading,
  threshold = 200
}: InfiniteScrollOptions) => {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);

    // Check if we're near the bottom and should load more
    if (
      hasNextPage &&
      !isLoading &&
      scrollHeight - scrollTop - clientHeight < threshold
    ) {
      await loadMore();
    }
  }, [hasNextPage, isLoading, loadMore, threshold]);

  return {
    handleScroll,
    scrollTop
  };
};

export default useVirtualization;