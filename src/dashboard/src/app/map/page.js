'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const DEFAULT_ZOOM = 0.1;
const MAX_ZOOM = 2;
const REFRESH_INTERVAL = 30_000;

const IMAGE_SRC = '/images/maps/hagga-basin.png';

const styles = {
  terminal: {
    position: 'fixed',
    background: '#17110b',
    border: '1px solid #6f4e2d',
    boxShadow:
      '0 25px 80px rgba(0,0,0,.75), 0 0 0 1px rgba(218,178,116,.08)',
    color: '#e5d2b3',
    fontFamily:
      '"Cascadia Code", "Cascadia Mono", Consolas, "Courier New", monospace',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8,
  },

  titleBar: {
    height: 38,
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
    background:
      'linear-gradient(180deg, #332416 0%, #24180f 100%)',
    borderBottom: '1px solid #6b4929',
    userSelect: 'none',
  },

  titleIcon: {
    width: 42,
    textAlign: 'center',
    color: '#d8a75f',
    fontSize: 15,
    fontWeight: 'bold',
  },

  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: '#ead8ba',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  windowButton: {
    width: 44,
    height: '100%',
    border: 0,
    background: 'transparent',
    color: '#bda987',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 15,
    transition: 'background .12s, color .12s',
  },

  toolbar: {
    height: 36,
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 9px',
    background: '#1d140c',
    borderBottom: '1px solid #4b331e',
    overflow: 'hidden',
  },

  terminalButton: {
    height: 25,
    background: '#24180e',
    border: '1px solid #624324',
    color: '#d9c19c',
    padding: '0 9px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 11,
    borderRadius: 3,
    flexShrink: 0,
  },

  statusBar: {
    height: 26,
    minHeight: 26,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    background: '#21160d',
    borderTop: '1px solid #4b331e',
    color: '#806d55',
    fontSize: 10,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function getCoordinate(marker, axis) {
  if (!marker || typeof marker !== 'object') {
    return NaN;
  }

  const value =
    axis === 'x'
      ? marker.x ??
        marker.pos_x ??
        marker.longitude ??
        marker.position?.x ??
        marker.coordinates?.x
      : marker.y ??
        marker.pos_y ??
        marker.latitude ??
        marker.position?.y ??
        marker.coordinates?.y;

  return toNumber(value);
}

function getMarkerName(marker, index) {
  return (
    marker?.name ||
    marker?.base_name ||
    marker?.baseName ||
    marker?.owner_name ||
    marker?.character_name ||
    `Base ${index + 1}`
  );
}

function getMarkerArray(data) {
  if (Array.isArray(data?.markers)) {
    return data.markers;
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  return [];
}

function getMapConfig(data) {
  if (data?.map) {
    return data.map;
  }

  if (
    data?.maps &&
    data?.defaultMap &&
    data.maps[data.defaultMap]
  ) {
    return data.maps[data.defaultMap];
  }

  if (data?.maps) {
    const firstMap = Object.values(data.maps)[0];

    if (firstMap) {
      return firstMap;
    }
  }

  if (data?.config) {
    return data.config;
  }

  return null;
}

function worldToMapPoint(marker, map) {
  const x = getCoordinate(marker, 'x');
  const y = getCoordinate(marker, 'y');

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !map
  ) {
    return null;
  }

  const width = Number(map.width);
  const height = Number(map.height);

  const minX = Number(map.minX);
  const maxX = Number(map.maxX);

  const minY = Number(map.minY);
  const maxY = Number(map.maxY);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY) ||
    maxX === minX ||
    maxY === minY
  ) {
    return null;
  }

  const normalizedX =
    (x - minX) / (maxX - minX);

  let normalizedY =
    (y - minY) / (maxY - minY);

  if (map.flipY) {
    normalizedY = 1 - normalizedY;
  }

  return {
    px: normalizedX * width,
    py: normalizedY * height,
    x,
    y,
    inBounds:
      normalizedX >= 0 &&
      normalizedX <= 1 &&
      normalizedY >= 0 &&
      normalizedY <= 1,
  };
}

function mapPointToWorld(px, py, map) {
  if (!map) {
    return null;
  }

  const width = Number(map.width);
  const height = Number(map.height);

  const minX = Number(map.minX);
  const maxX = Number(map.maxX);

  const minY = Number(map.minY);
  const maxY = Number(map.maxY);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY) ||
    maxX === minX ||
    maxY === minY
  ) {
    return null;
  }

  let normalizedY = py / height;

  if (map.flipY) {
    normalizedY = 1 - normalizedY;
  }

  return {
    x:
      minX +
      (px / width) *
        (maxX - minX),

    y:
      minY +
      normalizedY *
        (maxY - minY),
  };
}

function clampZoom(value, minimum) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(MAX_ZOOM, value)
  );
}

function markerKey(marker, index) {
  return String(
    marker?.base_id ??
      marker?.id ??
      `base-${index}`
  );
}

export default function HaggaBasinMap() {
  const [mapConfig, setMapConfig] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [target, setTarget] = useState(null);

  const [drag, setDrag] = useState(null);

  const [windowState, setWindowState] = useState({
    x: 0,
    y: 0,
    width: 1100,
    height: 700,
    minimized: false,
    maximized: false,
  });

  const [windowDrag, setWindowDrag] = useState(null);

  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const zoomAnchorRef = useRef(null);

  /*
   * --------------------------------------------------
   * LOAD MAP
   * --------------------------------------------------
   */

  const loadMap = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        const response = await fetch(
          '/api/map/markers?map=HaggaBasin',
          {
            method: 'GET',
            cache: 'no-store',
            headers: {
              Accept: 'application/json',
            },
            signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Map API returned ${response.status}`
          );
        }

        const data = await response.json();

        const map = getMapConfig(data);
        const rows = getMarkerArray(data);

        const baseRows = rows.filter(
          (marker) =>
            String(marker?.type || '')
              .trim()
              .toLowerCase() === 'base'
        );

        if (!map) {
          throw new Error(
            'Map API did not return a map configuration.'
          );
        }

        setMapConfig(map);
        setMarkers(baseRows);
        setError('');
      } catch (err) {
        if (err?.name === 'AbortError') {
          return;
        }

        setError(
          err?.message || 'Failed to load map'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * --------------------------------------------------
   * LIVE REFRESH
   * --------------------------------------------------
   */

  useEffect(() => {
    let active = true;
    let controller;

    const load = () => {
      if (!active) {
        return;
      }

      controller?.abort();

      controller = new AbortController();

      void loadMap(controller.signal);
    };

    load();

    const interval = window.setInterval(
      load,
      REFRESH_INTERVAL
    );

    return () => {
      active = false;

      controller?.abort();

      window.clearInterval(interval);
    };
  }, [loadMap]);

  /*
   * --------------------------------------------------
   * RESPONSIVE TERMINAL SIZE
   *
   * The important fix:
   * terminal size is calculated from the map
   * aspect ratio instead of using 1100x700.
   * --------------------------------------------------
   */

  const resizeTerminal = useCallback(() => {
    if (!mapConfig || windowState.maximized) {
      return;
    }

    const mapWidth = Number(mapConfig.width);
    const mapHeight = Number(mapConfig.height);

    if (
      !Number.isFinite(mapWidth) ||
      !Number.isFinite(mapHeight) ||
      mapWidth <= 0 ||
      mapHeight <= 0
    ) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const horizontalPadding =
      viewportWidth <= 600 ? 16 : 36;

    const verticalPadding =
      viewportHeight <= 600 ? 16 : 36;

    const maxWidth =
      viewportWidth - horizontalPadding;

    const maxHeight =
      viewportHeight - verticalPadding;

    /*
     * Chrome inside terminal:
     *
     * title = 38
     * toolbar = 36
     * status = 26
     */
    const chromeHeight = 100;

    const mapRatio =
      mapWidth / mapHeight;

    /*
     * Start by fitting the map to the available
     * screen width.
     */
    let terminalWidth = maxWidth;

    let mapAreaHeight =
      terminalWidth / mapRatio;

    let terminalHeight =
      mapAreaHeight + chromeHeight;

    /*
     * If that is too tall, calculate from height.
     */
    if (terminalHeight > maxHeight) {
      terminalHeight = maxHeight;

      mapAreaHeight =
        terminalHeight - chromeHeight;

      terminalWidth =
        mapAreaHeight * mapRatio;
    }

    /*
     * Keep sensible minimum dimensions.
     */
    terminalWidth = Math.max(
      Math.min(terminalWidth, maxWidth),
      Math.min(320, maxWidth)
    );

    terminalHeight = Math.max(
      Math.min(
        terminalHeight,
        maxHeight
      ),
      Math.min(260, maxHeight)
    );

    setWindowState((current) => ({
      ...current,
      width: Math.round(terminalWidth),
      height: Math.round(terminalHeight),
    }));
  }, [
    mapConfig,
    windowState.maximized,
  ]);

  useEffect(() => {
    resizeTerminal();

    window.addEventListener(
      'resize',
      resizeTerminal
    );

    return () => {
      window.removeEventListener(
        'resize',
        resizeTerminal
      );
    };
  }, [resizeTerminal]);

  /*
   * --------------------------------------------------
   * CENTER TERMINAL
   * --------------------------------------------------
   */

  useEffect(() => {
    if (windowState.maximized) {
      return;
    }

    const center = () => {
      setWindowState((current) => ({
        ...current,
        x: Math.max(
          8,
          Math.round(
            (window.innerWidth -
              current.width) /
              2
          )
        ),
        y: Math.max(
          8,
          Math.round(
            (window.innerHeight -
              current.height) /
              2
          )
        ),
      }));
    };

    center();

    window.addEventListener(
      'resize',
      center
    );

    return () => {
      window.removeEventListener(
        'resize',
        center
      );
    };
  }, [
    windowState.width,
    windowState.height,
    windowState.maximized,
  ]);

  /*
   * --------------------------------------------------
   * FIT ZOOM
   * --------------------------------------------------
   */

  const getMinimumZoom = useCallback(() => {
    const frame = frameRef.current;

    if (!frame || !mapConfig) {
      return DEFAULT_ZOOM;
    }

    const width = Number(mapConfig.width);
    const height = Number(mapConfig.height);

    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      return DEFAULT_ZOOM;
    }

    /*
     * Because the terminal itself follows the image
     * aspect ratio, these two values should normally
     * be almost identical.
     */
    return Math.min(
      frame.clientWidth / width,
      frame.clientHeight / height
    );
  }, [mapConfig]);

  useEffect(() => {
    if (!mapConfig) {
      return;
    }

    const updateZoom = () => {
      const minimum = getMinimumZoom();

      setZoom((current) =>
        current < minimum
          ? minimum
          : current
      );
    };

    updateZoom();

    window.addEventListener(
      'resize',
      updateZoom
    );

    return () => {
      window.removeEventListener(
        'resize',
        updateZoom
      );
    };
  }, [
    mapConfig,
    getMinimumZoom,
  ]);

  /*
   * --------------------------------------------------
   * CENTER IMAGE ON LOAD
   * --------------------------------------------------
   */

  useLayoutEffect(() => {
    if (
      !mapConfig ||
      !frameRef.current
    ) {
      return;
    }

    const frame = frameRef.current;

    const centerMap = () => {
      const width =
        Number(mapConfig.width) *
        zoom;

      const height =
        Number(mapConfig.height) *
        zoom;

      frame.scrollLeft = Math.max(
        0,
        (width -
          frame.clientWidth) /
          2
      );

      frame.scrollTop = Math.max(
        0,
        (height -
          frame.clientHeight) /
          2
      );
    };

    requestAnimationFrame(centerMap);
  }, [mapConfig]);

  /*
   * --------------------------------------------------
   * ZOOM
   * --------------------------------------------------
   */

  const setZoomAround = useCallback(
    (nextZoom, anchor) => {
      const frame = frameRef.current;
      const canvas = canvasRef.current;

      if (!frame || !mapConfig) {
        return;
      }

      const minimum =
        getMinimumZoom();

      const next = clampZoom(
        nextZoom,
        minimum
      );

      if (next === zoom) {
        return;
      }

      const frameRect =
        frame.getBoundingClientRect();

      const canvasRect =
        canvas?.getBoundingClientRect();

      const viewportX = anchor
        ? anchor.clientX -
          frameRect.left
        : frame.clientWidth / 2;

      const viewportY = anchor
        ? anchor.clientY -
          frameRect.top
        : frame.clientHeight / 2;

      const mapX =
        anchor && canvasRect
          ? (anchor.clientX -
              canvasRect.left) /
            zoom
          : (frame.scrollLeft +
              frame.clientWidth / 2) /
            zoom;

      const mapY =
        anchor && canvasRect
          ? (anchor.clientY -
              canvasRect.top) /
            zoom
          : (frame.scrollTop +
              frame.clientHeight / 2) /
            zoom;

      zoomAnchorRef.current = {
        mapX,
        mapY,
        viewportX,
        viewportY,
      };

      setZoom(next);
    },
    [
      mapConfig,
      zoom,
      getMinimumZoom,
    ]
  );

  /*
   * --------------------------------------------------
   * PRESERVE ZOOM POSITION
   * --------------------------------------------------
   */

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const anchor = zoomAnchorRef.current;

    if (!frame || !anchor) {
      return;
    }

    frame.scrollLeft =
      anchor.mapX * zoom -
      anchor.viewportX;

    frame.scrollTop =
      anchor.mapY * zoom -
      anchor.viewportY;

    zoomAnchorRef.current = null;
  }, [zoom]);

  /*
   * --------------------------------------------------
   * WHEEL ZOOM
   * --------------------------------------------------
   */

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const handleWheel = (event) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        return;
      }

      event.preventDefault();

      setZoomAround(
        zoom *
          (event.deltaY < 0
            ? 1.12
            : 0.88),
        {
          clientX: event.clientX,
          clientY: event.clientY,
        }
      );
    };

    frame.addEventListener(
      'wheel',
      handleWheel,
      { passive: false }
    );

    return () => {
      frame.removeEventListener(
        'wheel',
        handleWheel
      );
    };
  }, [
    zoom,
    setZoomAround,
  ]);

  /*
   * --------------------------------------------------
   * MAP DRAG
   * --------------------------------------------------
   */

  const handleMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    if (
      event.target.closest(
        '.hag-map-marker'
      )
    ) {
      return;
    }

    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    setDrag({
      x: event.clientX,
      y: event.clientY,
      left: frame.scrollLeft,
      top: frame.scrollTop,
    });
  };

  const handleMouseMove = (event) => {
    if (
      !drag ||
      !frameRef.current
    ) {
      return;
    }

    frameRef.current.scrollLeft =
      drag.left -
      (event.clientX - drag.x);

    frameRef.current.scrollTop =
      drag.top -
      (event.clientY - drag.y);
  };

  const stopDragging = () => {
    setDrag(null);
  };

  /*
   * --------------------------------------------------
   * DOUBLE CLICK TARGET
   * --------------------------------------------------
   */

  const handleDoubleClick = (event) => {
    if (
      !mapConfig ||
      !canvasRef.current
    ) {
      return;
    }

    if (
      event.target.closest(
        '.hag-map-marker'
      )
    ) {
      return;
    }

    const rect =
      canvasRef.current.getBoundingClientRect();

    const px =
      (event.clientX -
        rect.left) /
      zoom;

    const py =
      (event.clientY -
        rect.top) /
      zoom;

    const world =
      mapPointToWorld(
        px,
        py,
        mapConfig
      );

    if (world) {
      setTarget(world);
    }
  };

  /*
   * --------------------------------------------------
   * FIT MAP
   * --------------------------------------------------
   */

  const fitMap = useCallback(() => {
    if (
      !mapConfig ||
      !frameRef.current
    ) {
      return;
    }

    const next =
      getMinimumZoom();

    zoomAnchorRef.current = null;

    setZoom(next);

    requestAnimationFrame(() => {
      const frame =
        frameRef.current;

      if (!frame) {
        return;
      }

      const width =
        Number(mapConfig.width) *
        next;

      const height =
        Number(mapConfig.height) *
        next;

      frame.scrollLeft = Math.max(
        0,
        (width -
          frame.clientWidth) /
          2
      );

      frame.scrollTop = Math.max(
        0,
        (height -
          frame.clientHeight) /
          2
      );
    });
  }, [
    mapConfig,
    getMinimumZoom,
  ]);

  /*
   * --------------------------------------------------
   * TERMINAL DRAG
   * --------------------------------------------------
   */

  const handleWindowMouseDown = (
    event
  ) => {
    if (event.button !== 0) {
      return;
    }

    if (windowState.maximized) {
      return;
    }

    setWindowDrag({
      startX: event.clientX,
      startY: event.clientY,
      startWindowX: windowState.x,
      startWindowY: windowState.y,
    });
  };

  useEffect(() => {
    if (!windowDrag) {
      return;
    }

    const move = (event) => {
      setWindowState((current) => ({
        ...current,

        x:
          windowDrag.startWindowX +
          event.clientX -
          windowDrag.startX,

        y:
          windowDrag.startWindowY +
          event.clientY -
          windowDrag.startY,
      }));
    };

    const up = () => {
      setWindowDrag(null);
    };

    window.addEventListener(
      'mousemove',
      move
    );

    window.addEventListener(
      'mouseup',
      up
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        move
      );

      window.removeEventListener(
        'mouseup',
        up
      );
    };
  }, [windowDrag]);

  /*
   * --------------------------------------------------
   * MAXIMIZE
   * --------------------------------------------------
   */

  const toggleMaximize = () => {
    setWindowState((current) => ({
      ...current,
      maximized:
        !current.maximized,
      minimized: false,
    }));
  };

  /*
   * --------------------------------------------------
   * KEYBOARD
   * --------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelected(null);
        return;
      }

      if (
        event.target instanceof
          HTMLInputElement ||
        event.target instanceof
          HTMLTextAreaElement
      ) {
        return;
      }

      if (
        event.key === '+' ||
        event.key === '='
      ) {
        event.preventDefault();

        setZoomAround(
          zoom * 1.18
        );
      }

      if (event.key === '-') {
        event.preventDefault();

        setZoomAround(
          zoom * 0.84
        );
      }

      if (
        event.key.toLowerCase() ===
        'f'
      ) {
        event.preventDefault();
        fitMap();
      }

      if (
        event.key.toLowerCase() ===
        'r'
      ) {
        event.preventDefault();

        const controller =
          new AbortController();

        void loadMap(
          controller.signal
        );
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    zoom,
    setZoomAround,
    fitMap,
    loadMap,
  ]);

  /*
   * --------------------------------------------------
   * MARKERS
   * --------------------------------------------------
   */

  const plottedMarkers = useMemo(() => {
    if (!mapConfig) {
      return [];
    }

    return markers
      .map((marker, index) => ({
        marker,
        index,
        point:
          worldToMapPoint(
            marker,
            mapConfig
          ),
      }))
      .filter(
        ({ point }) =>
          point && point.inBounds
      );
  }, [
    markers,
    mapConfig,
  ]);

  /*
   * --------------------------------------------------
   * TARGET
   * --------------------------------------------------
   */

  const targetPoint = useMemo(() => {
    if (
      !target ||
      !mapConfig
    ) {
      return null;
    }

    return worldToMapPoint(
      target,
      mapConfig
    );
  }, [
    target,
    mapConfig,
  ]);

  const zoomPercent =
    Math.round(zoom * 100);

  /*
   * --------------------------------------------------
   * TERMINAL STYLE
   * --------------------------------------------------
   */

  const terminalStyle = {
    ...styles.terminal,

    left: windowState.maximized
      ? 0
      : windowState.x,

    top: windowState.maximized
      ? 0
      : windowState.y,

    width: windowState.maximized
      ? '100vw'
      : windowState.width,

    height: windowState.maximized
      ? '100vh'
      : windowState.height,

    zIndex: 100,

    borderRadius:
      windowState.maximized
        ? 0
        : 8,
  };

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',

        background:
          'radial-gradient(circle at 50% 40%, #392717 0%, #1a1109 45%, #080604 100%)',

        color: '#e5d2b3',

        fontFamily:
          '"Cascadia Code", "Cascadia Mono", Consolas, "Courier New", monospace',
      }}
    >
      {!windowState.minimized && (
        <div style={terminalStyle}>

          {/* TITLE BAR */}

          <div
            onMouseDown={
              handleWindowMouseDown
            }
            onDoubleClick={
              toggleMaximize
            }
            style={{
              ...styles.titleBar,

              cursor:
                windowState.maximized
                  ? 'default'
                  : windowDrag
                    ? 'grabbing'
                    : 'grab',
            }}
          >
            <div
              style={styles.titleIcon}
            >
              ▸_
            </div>

            <div
              style={styles.title}
            >
              HAGGA BASIN — LIVE MAP
            </div>

            <button
              type="button"
              title="Minimize"
              style={
                styles.windowButton
              }
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              onClick={() =>
                setWindowState(
                  (current) => ({
                    ...current,
                    minimized:
                      true,
                  })
                )
              }
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  '#4a311c';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
              }}
            >
              −
            </button>

            <button
              type="button"
              title="Maximize"
              style={
                styles.windowButton
              }
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              onClick={
                toggleMaximize
              }
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  '#4a311c';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
              }}
            >
              {windowState.maximized
                ? '❐'
                : '□'}
            </button>

            <button
              type="button"
              title="Close"
              style={
                styles.windowButton
              }
              onMouseDown={(event) =>
                event.stopPropagation()
              }
              onClick={() => {
                window.location.href =
                  '/portal';
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  '#7c2f20';
                event.currentTarget.style.color =
                  '#fff';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  'transparent';
                event.currentTarget.style.color =
                  '#bda987';
              }}
            >
              ×
            </button>
          </div>

          {/* TOOLBAR */}

          <div
            style={styles.toolbar}
          >
            <span
              style={{
                color: '#d8a75f',
                fontSize: 11,
                marginRight: 4,
              }}
            >
              C:\HAGGA\MAP&gt;
            </span>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={() =>
                setZoomAround(
                  zoom * 0.84
                )
              }
            >
              −
            </button>

            <span
              style={{
                minWidth: 62,
                textAlign: 'center',
                fontSize: 10,
                color: '#d8a75f',
              }}
            >
              ZOOM {zoomPercent}%
            </span>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={() =>
                setZoomAround(
                  zoom * 1.18
                )
              }
            >
              +
            </button>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={fitMap}
            >
              FIT
            </button>

            <button
              type="button"
              style={
                styles.terminalButton
              }
              onClick={() => {
                const controller =
                  new AbortController();

                void loadMap(
                  controller.signal
                );
              }}
            >
              REFRESH
            </button>

            <span
              className="desktop-hints"
              style={{
                marginLeft: 'auto',
                color: '#6f5b43',
                fontSize: 10,
              }}
            >
              F=FIT&nbsp;&nbsp;
              R=REFRESH&nbsp;&nbsp;
              +/-=ZOOM&nbsp;&nbsp;
              ESC=CLOSE
            </span>
          </div>

          {/* MAP FRAME */}

          <div
            ref={frameRef}
            className="hag-map-frame"
            onMouseDown={
              handleMouseDown
            }
            onMouseMove={
              handleMouseMove
            }
            onMouseUp={
              stopDragging
            }
            onMouseLeave={
              stopDragging
            }
            onDoubleClick={
              handleDoubleClick
            }
            style={{
              position: 'relative',

              /*
               * This is important.
               *
               * The map frame occupies exactly the
               * remaining terminal space.
               */
              flex: 1,

              minHeight: 0,
              minWidth: 0,

              overflow: 'auto',

              cursor: drag
                ? 'grabbing'
                : 'grab',

              background: '#0c0804',

              scrollbarWidth: 'thin',
              scrollbarColor:
                '#594127 #100b07',
            }}
          >
            {mapConfig ? (
              <div
                ref={canvasRef}
                style={{
                  position:
                    'relative',

                  width:
                    Number(
                      mapConfig.width
                    ) * zoom,

                  height:
                    Number(
                      mapConfig.height
                    ) * zoom,

                  flexShrink: 0,

                  /*
                   * NO extra padding.
                   * NO min-width.
                   * NO black canvas around
                   * the actual image.
                   */
                  margin: 0,
                }}
              >
                {/* MAP IMAGE */}

                <img
                  src={IMAGE_SRC}
                  alt={
                    mapConfig?.label ||
                    'Hagga Basin'
                  }
                  draggable={false}
                  style={{
                    position:
                      'absolute',

                    left: 0,
                    top: 0,

                    width: '100%',
                    height: '100%',

                    display: 'block',

                    /*
                     * fill the exact canvas.
                     */
                    objectFit: 'fill',

                    userSelect: 'none',
                    pointerEvents:
                      'none',
                  }}
                />

                {/* DUNE GRID */}

                <div
                  style={{
                    position:
                      'absolute',

                    inset: 0,

                    pointerEvents:
                      'none',

                    backgroundImage:
                      `
                      linear-gradient(
                        rgba(216,167,95,.045) 1px,
                        transparent 1px
                      ),
                      linear-gradient(
                        90deg,
                        rgba(216,167,95,.045) 1px,
                        transparent 1px
                      )
                    `,

                    backgroundSize:
                      `${Math.max(
                        25,
                        100 * zoom
                      )}px ${Math.max(
                        25,
                        100 * zoom
                      )}px`,
                  }}
                />

                {/* TARGET */}

                {targetPoint && (
                  <span
                    style={{
                      position:
                        'absolute',

                      left:
                        targetPoint.px *
                        zoom,

                      top:
                        targetPoint.py *
                        zoom,

                      width: 22,
                      height: 22,

                      transform:
                        'translate(-50%, -50%)',

                      border:
                        '1px solid #d8a75f',

                      borderRadius:
                        '50%',

                      boxShadow:
                        '0 0 0 4px rgba(216,167,95,.12), 0 0 20px rgba(216,167,95,.75)',

                      pointerEvents:
                        'none',

                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        position:
                          'absolute',

                        left: '50%',
                        top: -8,

                        width: 1,
                        height: 38,

                        background:
                          'rgba(216,167,95,.7)',

                        transform:
                          'translateX(-50%)',
                      }}
                    />

                    <span
                      style={{
                        position:
                          'absolute',

                        top: '50%',
                        left: -8,

                        width: 38,
                        height: 1,

                        background:
                          'rgba(216,167,95,.7)',

                        transform:
                          'translateY(-50%)',
                      }}
                    />
                  </span>
                )}

                {/* BASE MARKERS */}

                {plottedMarkers.map(
                  ({
                    marker,
                    index,
                    point,
                  }) => {
                    const name =
                      getMarkerName(
                        marker,
                        index
                      );

                    const key =
                      markerKey(
                        marker,
                        index
                      );

                    /*
                     * Marker remains readable,
                     * but scales slightly with zoom.
                     */
                    const iconSize =
                      Math.max(
                        22,
                        Math.min(
                          42,
                          34 * zoom
                        )
                      );

                    return (
                      <button
                        key={key}
                        type="button"
                        className="hag-map-marker"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setSelected(
                            marker
                          );
                        }}
                        title={`${name} — X: ${point.x.toFixed(
                          0
                        )}, Y: ${point.y.toFixed(
                          0
                        )}`}
                        style={{
                          position:
                            'absolute',

                          left:
                            point.px *
                            zoom,

                          top:
                            point.py *
                            zoom,

                          transform:
                            'translate(-50%, -50%)',

                          width:
                            Math.max(
                              100,
                              iconSize +
                                20
                            ),

                          minHeight:
                            iconSize +
                            24,

                          padding: 0,
                          margin: 0,

                          border: 0,
                          outline: 'none',

                          background:
                            'transparent',

                          color:
                            '#e5d2b3',

                          cursor:
                            'pointer',

                          textAlign:
                            'center',

                          display:
                            'flex',

                          flexDirection:
                            'column',

                          alignItems:
                            'center',

                          justifyContent:
                            'center',

                          zIndex: 5,
                        }}
                      >
                        <span
                          style={{
                            width:
                              iconSize,

                            height:
                              iconSize,

                            display:
                              'flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            flexShrink: 0,
                          }}
                        >
                          <img
                            src="/map-icons/Base.webp"
                            alt={name}
                            draggable={
                              false
                            }
                            style={{
                              width:
                                iconSize,

                              height:
                                iconSize,

                              display:
                                'block',

                              objectFit:
                                'contain',

                              filter:
                                'drop-shadow(0 2px 5px rgba(0,0,0,.9))',

                              userSelect:
                                'none',

                              pointerEvents:
                                'none',
                            }}
                          />
                        </span>

                        <span
                          style={{
                            display:
                              'block',

                            maxWidth:
                              180,

                            overflow:
                              'hidden',

                            textOverflow:
                              'ellipsis',

                            background:
                              'rgba(23,14,7,.94)',

                            border:
                              '1px solid #6f4e2d',

                            padding:
                              '2px 6px',

                            marginTop: 2,

                            color:
                              '#ead8ba',

                            fontSize:
                              '0.7rem',

                            lineHeight:
                              '1.1',

                            whiteSpace:
                              'nowrap',

                            boxShadow:
                              '0 2px 8px rgba(0,0,0,.7)',

                            pointerEvents:
                              'none',
                          }}
                        >
                          {name}
                        </span>

                        {marker?.owner_name && (
                          <span
                            style={{
                              display:
                                'block',

                              maxWidth:
                                180,

                              overflow:
                                'hidden',

                              textOverflow:
                                'ellipsis',

                              marginTop: 1,

                              color:
                                '#9b8468',

                              fontSize:
                                '0.6rem',

                              lineHeight:
                                '1.1',

                              whiteSpace:
                                'nowrap',

                              pointerEvents:
                                'none',
                            }}
                          >
                            {
                              marker.owner_name
                            }
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <div
                style={{
                  position:
                    'absolute',

                  inset: 0,

                  display: 'grid',

                  placeItems:
                    'center',

                  color: '#806d55',

                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    textAlign:
                      'center',
                  }}
                >
                  <div
                    style={{
                      color:
                        '#d8a75f',

                      marginBottom:
                        8,
                    }}
                  >
                    C:\HAGGA\MAP&gt;
                  </div>

                  {loading
                    ? 'Loading map...'
                    : 'Map unavailable'}
                </div>
              </div>
            )}
          </div>

          {/* SELECTED BASE */}

          {selected && (
            <div
              style={{
                position:
                  'absolute',

                right: 14,
                bottom: 40,

                width: 285,

                maxWidth:
                  'calc(100% - 28px)',

                background:
                  'rgba(23,14,7,.97)',

                border:
                  '1px solid #765333',

                boxShadow:
                  '0 10px 30px rgba(0,0,0,.8)',

                zIndex: 30,

                fontFamily:
                  'inherit',
              }}
            >
              <div
                style={{
                  height: 30,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  padding:
                    '0 8px',

                  background:
                    '#2a1b0f',

                  borderBottom:
                    '1px solid #543a21',
                }}
              >
                <span
                  style={{
                    flex: 1,

                    fontSize: 11,

                    color:
                      '#d8a75f',
                  }}
                >
                  BASE_INFO.EXE
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(null)
                  }
                  style={{
                    border: 0,

                    background:
                      'transparent',

                    color:
                      '#9b8468',

                    cursor:
                      'pointer',

                    fontFamily:
                      'inherit',

                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  padding: 12,

                  fontSize: 11,

                  lineHeight: 1.7,
                }}
              >
                <div
                  style={{
                    color:
                      '#ead8ba',

                    fontSize: 13,

                    marginBottom:
                      8,
                  }}
                >
                  {getMarkerName(
                    selected,
                    0
                  )}
                </div>

                <div>
                  <span
                    style={{
                      color:
                        '#765f46',
                    }}
                  >
                    TYPE:
                  </span>{' '}
                  {selected.type ||
                    'Base'}
                </div>

                <div>
                  <span
                    style={{
                      color:
                        '#765f46',
                    }}
                  >
                    ID:
                  </span>{' '}
                  {selected.id ||
                    selected.base_id ||
                    '—'}
                </div>

                <div>
                  <span
                    style={{
                      color:
                        '#765f46',
                    }}
                  >
                    X:
                  </span>{' '}
                  {getCoordinate(
                    selected,
                    'x'
                  )}
                </div>

                <div>
                  <span
                    style={{
                      color:
                        '#765f46',
                    }}
                  >
                    Y:
                  </span>{' '}
                  {getCoordinate(
                    selected,
                    'y'
                  )}
                </div>

                <div>
                  <span
                    style={{
                      color:
                        '#765f46',
                    }}
                  >
                    OWNER:
                  </span>{' '}
                  {selected.owner_name ||
                    'Unknown'}
                </div>
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              style={{
                position:
                  'absolute',

                left: 12,
                top: 84,

                maxWidth: 400,

                padding:
                  '7px 10px',

                background:
                  'rgba(45,14,8,.95)',

                border:
                  '1px solid #783b2d',

                color:
                  '#e09a7a',

                fontSize: 10,

                zIndex: 40,
              }}
            >
              ERROR: {error}
            </div>
          )}

          {/* STATUS BAR */}

          <div
            style={
              styles.statusBar
            }
          >
            <span
              style={{
                color:
                  '#d8a75f',
              }}
            >
              ● LIVE
            </span>

            <span
              className="status-extra"
              style={{
                marginLeft: 14,
              }}
            >
              BASES:{' '}
              {markers.length}
            </span>

            <span
              className="status-extra"
              style={{
                marginLeft: 14,
              }}
            >
              MAP:{' '}
              {mapConfig
                ? `${mapConfig.width}×${mapConfig.height}`
                : '---'}
            </span>

            {target && (
              <span
                className="status-extra"
                style={{
                  marginLeft: 14,

                  color:
                    '#d8a75f',
                }}
              >
                TARGET:
                {' '}
                X:
                {Math.round(
                  target.x
                )}
                {' '}
                Y:
                {Math.round(
                  target.y
                )}
              </span>
            )}

            <span
              style={{
                marginLeft:
                  'auto',
              }}
            >
              SYNC: 30s
            </span>
          </div>
        </div>
      )}

      {/* MINIMIZED TERMINAL */}

      {windowState.minimized && (
        <button
          type="button"
          onClick={() =>
            setWindowState(
              (current) => ({
                ...current,
                minimized:
                  false,
              })
            )
          }
          style={{
            position: 'fixed',

            left: 15,
            bottom: 15,

            zIndex: 200,

            height: 38,

            padding:
              '0 16px',

            background:
              '#24180e',

            border:
              '1px solid #6f4e2d',

            color:
              '#ead8ba',

            boxShadow:
              '0 10px 30px rgba(0,0,0,.7)',

            cursor:
              'pointer',

            fontFamily:
              '"Cascadia Code", Consolas, monospace',

            fontSize: 11,

            borderRadius: 5,
          }}
        >
          <span
            style={{
              color:
                '#d8a75f',

              marginRight: 8,
            }}
          >
            ▸_
          </span>

          HAGGA BASIN — LIVE MAP
        </button>
      )}

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          width: 100%;
          height: 100%;
          background: #080604;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        .hag-map-frame {
          scrollbar-width: thin;
          scrollbar-color: #594127 #100b07;
        }

        .hag-map-frame::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .hag-map-frame::-webkit-scrollbar-track {
          background: #100b07;
        }

        .hag-map-frame::-webkit-scrollbar-thumb {
          background: #594127;
          border: 2px solid #100b07;
          border-radius: 3px;
        }

        .hag-map-frame::-webkit-scrollbar-thumb:hover {
          background: #795832;
        }

        .hag-map-marker:hover
          span:first-child
          img {
          filter:
            drop-shadow(0 0 6px rgba(216, 167, 95, 0.9))
            drop-shadow(0 2px 5px rgba(0, 0, 0, 0.9));
        }

        @media (max-width: 700px) {
          .desktop-hints {
            display: none !important;
          }

          .hag-map-frame {
            cursor: grab;
          }
        }

        @media (max-width: 480px) {
          .status-extra {
            display: none !important;
          }

          .hag-map-marker span:nth-child(2) {
            font-size: 9px !important;
            max-width: 120px !important;
          }

          .hag-map-marker span:nth-child(3) {
            display: none !important;
          }
        }

        @media (max-height: 500px) {
          .hag-map-marker span:nth-child(2),
          .hag-map-marker span:nth-child(3) {
            display: none !important;
          }
        }

        @media (pointer: coarse) {
          .hag-map-frame {
            cursor: grab;
          }
        }
      `}</style>
    </main>
  );
}