import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface RectangleNodeData {
  id: string;
  label: string;
}

const RectangleNode: React.FC<NodeProps<RectangleNodeData>> = ({
  data,
  isConnectable,
}) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id={`${data.id}.left`}
        style={{ borderRadius: "50%" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Right}
        id={`${data.id}.right`}
        style={{ borderRadius: "50%" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Top}
        id={`${data.id}.top`}
        style={{ borderRadius: "50%" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${data.id}.bottom`}
        style={{ borderRadius: "50%" }}
        isConnectable={isConnectable}
      />
      <div
        style={{
          width: 120,
          height: 90,
          backgroundColor: "white",
          color: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid black",
        }}
      >
        <div>{data.label}</div>
      </div>
    </>
  );
};
export default RectangleNode;
