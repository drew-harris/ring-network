import { Button } from "@/components/ui/button";
import { useContainerDimensions } from "@/lib/containerSize";
import { RealtimeClientContext } from "@/main";
import { Node } from "core/node";
import { motion } from "framer-motion";
import { useContext, useMemo, useRef, useState } from "react";

interface NodeViewProps {
  nodes: Node.Info[];
}
export const NodeView = (props: NodeViewProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(componentRef);
  // Render nodes in a circular pattern like a clock
  const [scale, setScale] = useState(0.84);
  // const radius = (Math.min(width, height) / 2) * 0.7;
  const radius = useMemo(
    () => (Math.min(width, height) / 2) * scale,
    [scale, height, width],
  );

  const r = useContext(RealtimeClientContext);

  const deleteRandomNode = () => {
    const randomNodeId =
      props.nodes[Math.floor(Math.random() * props.nodes.length)].nodeId;

    console.log("deleting node", randomNodeId);
    r.mutate.deleteNode(randomNodeId);
  };

  return (
    <div className="min-h-screen" ref={componentRef}>
      <div className="absolute">
        <div> Node Count: {props.nodes.length}</div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
        />
        <Button className="block" variant="outline" onClick={deleteRandomNode}>
          Delete Random Node
        </Button>
      </div>
      {props.nodes.map(
        (node, index) =>
          node.nodeId && (
            <motion.div
              key={node.nodeId}
              className="absolute"
              initial={false}
              animate={{
                x: Math.round(
                  width / 2 +
                    radius *
                      Math.cos((index * Math.PI * 2) / props.nodes.length),
                ),
                y: Math.round(
                  height / 2 +
                    radius *
                      Math.sin((index * Math.PI * 2) / props.nodes.length),
                ),
              }}
            >
              <div className="p-2 bg-neutral-700 rounded-md border border-neutral-600 min-w-12 text-center">
                <div>{node.nodeId}</div>
              </div>
            </motion.div>
          ),
      )}
    </div>
  );
};
