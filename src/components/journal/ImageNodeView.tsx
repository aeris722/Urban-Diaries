import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { ImageToolbar, type ImageAlignment } from "./ImageToolbar";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageNodeAttributes {
    src: string;
    alt?: string;
    title?: string;
    width?: number | null;
    height?: number | null;
    alignment?: "center" | "full";
    float?: "none";
    x?: number;
    y?: number;
    draggable?: boolean;
    // Store for smooth resize without bitmap degradation
    displayWidth?: number;
}

const MIN_IMAGE_WIDTH = 140;
const VIEWPORT_PADDING = 8;

type CornerHandle = "nw" | "ne" | "sw" | "se";

interface DragState {
    startPointerX: number;
    startPointerY: number;
    startX: number;
    startY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

interface ResizeState {
    handle: CornerHandle;
    startPointerX: number;
    startPointerY: number;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
    ratio: number;
    minWidth: number;
    maxWidth: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseNumberish = (value: unknown, fallback: number) => {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseAttrNumber = (value: string | null, fallback: number) => {
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseAlignment = (value: string | null): ImageAlignment => {
    if (value === "center" || value === "full") {
        return value;
    }
    return "center";
};

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        image: {
            setImage: (attributes: Partial<ImageNodeAttributes>) => ReturnType;
            updateImage: (attributes: Partial<ImageNodeAttributes>) => ReturnType;
            setImageAlignment: (alignment: ImageNodeAttributes["alignment"]) => ReturnType;
            setImageWidth: (width: number | null) => ReturnType;
            setImageFloat: (float: ImageNodeAttributes["float"]) => ReturnType;
            setImagePosition: (x: number, y: number) => ReturnType;
            deleteImage: () => ReturnType;
        };
    }
}

// Interactive image node view with in-context resize, drag, and alignment controls.
function ImageNodeView({ node, updateAttributes, selected, deleteNode, editor, getPos }: NodeViewProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    // Only show controls when explicitly selected (not on hover)
    const [showControls, setShowControls] = useState(false);

    const pendingAttrsRef = useRef<Partial<ImageNodeAttributes>>({});
    const rafRef = useRef<number | null>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const resizeStateRef = useRef<ResizeState | null>(null);

    const src = node.attrs.src as string;
    const alt = node.attrs.alt as string | undefined;
    const width = parseNumberish(node.attrs.width, 420);
    const height = parseNumberish(node.attrs.height, 0);
    const x = parseNumberish(node.attrs.x, 0);
    const y = parseNumberish(node.attrs.y, 0);
    const alignment = parseAlignment((node.attrs.alignment as string | null) ?? "center");
    const float = "none";

    // No longer supporting floating images
    const isFloating = false;

    const getEditorRect = useCallback(() => {
        const editorElement = frameRef.current?.closest(".tiptap") as HTMLElement | null;
        return editorElement?.getBoundingClientRect() ?? null;
    }, []);

    const flushAttrUpdates = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        if (Object.keys(pendingAttrsRef.current).length > 0) {
            updateAttributes(pendingAttrsRef.current);
            pendingAttrsRef.current = {};
        }
    }, [updateAttributes]);

    const scheduleAttrUpdate = useCallback(
        (nextAttrs: Partial<ImageNodeAttributes>) => {
            pendingAttrsRef.current = { ...pendingAttrsRef.current, ...nextAttrs };
            if (rafRef.current !== null) return;

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                if (Object.keys(pendingAttrsRef.current).length === 0) return;
                updateAttributes(pendingAttrsRef.current);
                pendingAttrsRef.current = {};
            });
        },
        [updateAttributes],
    );

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    const ensureImageSelected = useCallback(() => {
        if (selected || typeof getPos !== "function") return;
        const pos = getPos();
        if (typeof pos === "number") {
            editor.chain().focus().setNodeSelection(pos).run();
        }
    }, [editor, getPos, selected]);

    const handleDragStart = useCallback(
        (event: React.MouseEvent) => {
            if (isResizing) return;
            if (alignment === "full") return;
            const target = event.target as HTMLElement;
            if (target.closest(".resize-handle") || target.closest(".image-toolbar")) return;

            ensureImageSelected();

            const frameElement = frameRef.current;
            const editorRect = getEditorRect();
            if (!frameElement || !editorRect) return;

            const frameRect = frameElement.getBoundingClientRect();

            dragStateRef.current = {
                startPointerX: event.clientX,
                startPointerY: event.clientY,
                startX: x,
                startY: y,
                minX: x + (editorRect.left + VIEWPORT_PADDING - frameRect.left),
                maxX: x + (editorRect.right - VIEWPORT_PADDING - frameRect.right),
                minY: y + (editorRect.top + VIEWPORT_PADDING - frameRect.top),
                maxY: y + (editorRect.bottom - VIEWPORT_PADDING - frameRect.bottom),
            };

            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
        },
        [alignment, ensureImageSelected, getEditorRect, isResizing, x, y],
    );

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (event: MouseEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState) return;

            const rawX = dragState.startX + (event.clientX - dragState.startPointerX);
            const rawY = dragState.startY + (event.clientY - dragState.startPointerY);

            const nextX = clamp(rawX, dragState.minX, dragState.maxX);
            const nextY = clamp(rawY, dragState.minY, dragState.maxY);
            scheduleAttrUpdate({ x: Math.round(nextX), y: Math.round(nextY) });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            dragStateRef.current = null;
            flushAttrUpdates();
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [flushAttrUpdates, isDragging, scheduleAttrUpdate]);

    const handleResizeStart = useCallback(
        (event: React.MouseEvent, handle: CornerHandle) => {
            // No floating image resize logic - removed left/right support
            event.preventDefault();
            event.stopPropagation();

            ensureImageSelected();

            const frameElement = frameRef.current;
            const editorRect = getEditorRect();
            if (!frameElement || !editorRect) return;

            const frameRect = frameElement.getBoundingClientRect();
            const startWidth = frameRect.width;
            const startHeight = frameRect.height || (height > 0 ? height : startWidth);
            const ratio = startHeight > 0 ? startWidth / startHeight : 1;

            const leftRoom = frameRect.left - (editorRect.left + VIEWPORT_PADDING);
            const rightRoom = editorRect.right - VIEWPORT_PADDING - frameRect.right;
            const topRoom = frameRect.top - (editorRect.top + VIEWPORT_PADDING);
            const bottomRoom = editorRect.bottom - VIEWPORT_PADDING - frameRect.bottom;

            const horizontalMax = handle.includes("w") ? startWidth + leftRoom : startWidth + rightRoom;
            const verticalMax = handle.includes("n") ? (startHeight + topRoom) * ratio : (startHeight + bottomRoom) * ratio;
            const maxWidth = Math.max(MIN_IMAGE_WIDTH, Math.min(horizontalMax, verticalMax, editorRect.width - VIEWPORT_PADDING * 2));

            resizeStateRef.current = {
                handle,
                startPointerX: event.clientX,
                startPointerY: event.clientY,
                startWidth,
                startHeight,
                startX: x,
                startY: y,
                ratio: ratio || 1,
                minWidth: MIN_IMAGE_WIDTH,
                maxWidth,
            };

            setIsResizing(true);
            document.dispatchEvent(new CustomEvent("image-resize-start"));
        },
        [ensureImageSelected, getEditorRect, height, x, y, alignment],
    );

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (event: MouseEvent) => {
            const resizeState = resizeStateRef.current;
            if (!resizeState) return;

            const deltaX = event.clientX - resizeState.startPointerX;
            const deltaY = event.clientY - resizeState.startPointerY;
            const horizontalDelta = resizeState.handle.includes("e") ? deltaX : -deltaX;
            const verticalDelta = (resizeState.handle.includes("s") ? deltaY : -deltaY) * resizeState.ratio;
            const delta = (horizontalDelta + verticalDelta) / 2;

            const nextWidth = clamp(resizeState.startWidth + delta, resizeState.minWidth, resizeState.maxWidth);

            // No floating image logic - removed left/right support
            const nextHeight = nextWidth / resizeState.ratio;

            // Directly update dimensions - no scale transform to avoid blur
            scheduleAttrUpdate({
                width: Math.round(nextWidth),
                height: Math.round(nextHeight),
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeStateRef.current = null;
            flushAttrUpdates();
            document.dispatchEvent(new CustomEvent("image-resize-end"));
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [alignment, flushAttrUpdates, isResizing, scheduleAttrUpdate]);

    const handleAlignmentChange = useCallback(
        (nextAlignment: ImageAlignment) => {
            const nextAttrs: Partial<ImageNodeAttributes> = { alignment: nextAlignment };
            if (nextAlignment === "center" || nextAlignment === "full") {
                nextAttrs.x = 0;
                nextAttrs.y = 0;
            }
            updateAttributes(nextAttrs);
        },
        [updateAttributes],
    );

    const handleFullWidth = useCallback(() => {
        updateAttributes({
            alignment: "full",
            x: 0,
            y: 0,
        });
    }, [updateAttributes]);

    const handleDelete = useCallback(() => {
        deleteNode?.();
    }, [deleteNode]);

    const handleImageLoad = useCallback(() => {
        const img = imageRef.current;
        if (!img) return;

        if (height > 0 && width > 0) return;

        const ratio = img.naturalWidth > 0 && img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1;
        const editorRect = getEditorRect();
        const defaultWidth = Math.max(MIN_IMAGE_WIDTH, Math.min(520, editorRect ? editorRect.width - 32 : 520, img.naturalWidth || 520));
        const defaultHeight = Math.max(1, Math.round(defaultWidth / ratio));

        updateAttributes({
            width: Math.round(width || defaultWidth),
            height: Math.round(height || defaultHeight),
        });
    }, [getEditorRect, height, updateAttributes, width]);

    const interactionActive = selected || isDragging || isResizing;

    const frameStyle: React.CSSProperties = {
        // No floating images - removed left/right support
        width: alignment === "full" ? "100%" : `${Math.round(Math.max(MIN_IMAGE_WIDTH, width))}px`,
        maxWidth: "100%",
        // Apply transform for non-full images during drag
        transform: alignment !== "full" ? `translate(${Math.round(x)}px, ${Math.round(y)}px)` : undefined,
        display: "block",
        zIndex: isDragging || isResizing ? 1200 : 3,
        transition: isDragging || isResizing ? "none" : "box-shadow 160ms ease, transform 120ms ease",
    };

    return (
        <NodeViewWrapper className="image-node-view">
            <div
                ref={frameRef}
                className={`image-node-container align-${alignment} ${isResizing ? "resize-active" : ""} ${isDragging ? "dragging" : ""}`}
                style={frameStyle}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => {
                    if (!selected && !isDragging && !isResizing) {
                        setShowControls(false);
                    }
                }}
                onMouseDown={handleDragStart}
            >
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt || "Journal image"}
                    onLoad={handleImageLoad}
                    className={`h-auto w-full rounded-lg object-contain shadow-lg transition-all duration-150 ${selected ? "ring-2 ring-offset-2" : ""} ${isResizing ? "" : ""}`}
                    style={{
                        display: "block",
                        cursor: isDragging ? "grabbing" : "grab",
                        ...(selected ? ({ "--tw-ring-color": "var(--accent-coffee)" } as React.CSSProperties) : {}),
                    }}
                    draggable={false}
                />

                {/* Only show resize handles when explicitly selected (not on hover) */}
                {selected && !isDragging && (
                    <>
                        <div className="resize-handle resize-handle--nw" onMouseDown={(e) => handleResizeStart(e, "nw")} />
                        <div className="resize-handle resize-handle--ne" onMouseDown={(e) => handleResizeStart(e, "ne")} />
                        <div className="resize-handle resize-handle--sw" onMouseDown={(e) => handleResizeStart(e, "sw")} />
                        <div className="resize-handle resize-handle--se" onMouseDown={(e) => handleResizeStart(e, "se")} />
                    </>
                )}

                {/* Show toolbar only when explicitly selected */}
                {selected && !isResizing && !isDragging && (
                    <div
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <ImageToolbar
                            alignment={alignment}
                            onAlignmentChange={handleAlignmentChange}
                            onDelete={handleDelete}
                            onFullWidth={handleFullWidth}
                        />
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
}

// Tiptap Node Extension
export const ImageNode = Node.create({
    name: "image",
    group: "block",
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("src"),
            },
            alt: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("alt"),
            },
            title: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute("title"),
            },
            width: {
                default: 420,
                parseHTML: (element: HTMLElement) => {
                    const explicit = element.getAttribute("data-width") || element.getAttribute("width");
                    return parseAttrNumber(explicit, 420);
                },
                renderHTML: (attributes: ImageNodeAttributes) => {
                    if (typeof attributes.width !== "number") return {};
                    return { "data-width": Math.round(attributes.width) };
                },
            },
            height: {
                default: null,
                parseHTML: (element: HTMLElement) => {
                    const explicit = element.getAttribute("data-height") || element.getAttribute("height");
                    const parsed = parseAttrNumber(explicit, 0);
                    return parsed > 0 ? parsed : null;
                },
                renderHTML: (attributes: ImageNodeAttributes) => {
                    if (typeof attributes.height !== "number" || attributes.height <= 0) return {};
                    return { "data-height": Math.round(attributes.height) };
                },
            },
            alignment: {
                default: "center",
                parseHTML: (element: HTMLElement) => parseAlignment(element.getAttribute("data-alignment")),
                renderHTML: (attributes: ImageNodeAttributes) => ({
                    "data-alignment": attributes.alignment || "center",
                }),
            },
            float: {
                default: "none",
            },
            x: {
                default: 0,
                parseHTML: (element: HTMLElement) => parseAttrNumber(element.getAttribute("data-x"), 0),
                renderHTML: (attributes: ImageNodeAttributes) => ({
                    "data-x": Math.round(attributes.x || 0),
                }),
            },
            y: {
                default: 0,
                parseHTML: (element: HTMLElement) => parseAttrNumber(element.getAttribute("data-y"), 0),
                renderHTML: (attributes: ImageNodeAttributes) => ({
                    "data-y": Math.round(attributes.y || 0),
                }),
            },
            draggable: {
                default: true,
                parseHTML: (element: HTMLElement) => element.getAttribute("data-draggable") !== "false",
                renderHTML: (attributes: ImageNodeAttributes) => ({
                    "data-draggable": attributes.draggable === false ? "false" : "true",
                }),
            },
        };
    },

    parseHTML(): { tag: string }[] {
        return [{ tag: "img[data-type='image']" }];
    },

    renderHTML({ HTMLAttributes }): DOMOutputSpec {
        const alignment = parseAlignment((HTMLAttributes["data-alignment"] ?? HTMLAttributes.alignment ?? "center") as string);
        const x = parseNumberish(HTMLAttributes["data-x"] ?? HTMLAttributes.x, 0);
        const y = parseNumberish(HTMLAttributes["data-y"] ?? HTMLAttributes.y, 0);
        const width = parseNumberish(HTMLAttributes["data-width"] ?? HTMLAttributes.width, 420);
        const hasOffset = alignment !== "full" && (x !== 0 || y !== 0);

        const styleParts = ["max-width: 100%", "height: auto"];
        if (alignment === "full") {
            styleParts.push("display: block", "width: 100%", "margin: 0 0 16px 0", "clear: both");
        } else {
            styleParts.push(`width: ${Math.round(width)}px`);
            // Only center alignment is supported now
            styleParts.push("display: block", "margin: 0 auto 16px auto", "clear: both");
            if (hasOffset) {
                styleParts.push(`transform: translate(${Math.round(x)}px, ${Math.round(y)}px)`);
            }
        }

        return [
            "img",
            mergeAttributes(HTMLAttributes, {
                "data-type": "image",
                class: "journal-image journal-image--" + alignment,
                style: styleParts.join("; "),
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
    },

    addCommands() {
        return {
            setImage:
                (attributes) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: attributes,
                        });
                    },
            updateImage:
                (attributes) =>
                    ({ commands }) => {
                        return commands.updateAttributes(this.name, attributes);
                    },
            setImageAlignment:
                (alignment) =>
                    ({ commands }) => {
                        return commands.updateAttributes(this.name, { alignment });
                    },
            setImageWidth:
                (width) =>
                    ({ commands }) => {
                        return commands.updateAttributes(this.name, { width });
                    },
            setImageFloat:
                (float) =>
                    ({ commands }) => {
                        return commands.updateAttributes(this.name, { float });
                    },
            setImagePosition:
                (x, y) =>
                    ({ commands }) => {
                        return commands.updateAttributes(this.name, { x, y });
                    },
            deleteImage:
                () =>
                    ({ state, dispatch }) => {
                        const { selection } = state;
                        const { $from } = selection;

                        if ($from.parent.type.name === "doc") {
                            const pos = $from.before($from.depth);
                            if (dispatch) {
                                state.tr.delete(pos, pos + 1);
                            }
                            return true;
                        }

                        let deleted = false;
                        state.doc.descendants((node, pos) => {
                            if (node.type.name === this.name && pos === $from.before($from.depth)) {
                                if (dispatch) {
                                    state.tr.delete(pos, pos + 1);
                                }
                                deleted = true;
                                return false;
                            }
                            return true;
                        });

                        return deleted;
                    },
        };
    },
});

export default ImageNode;
