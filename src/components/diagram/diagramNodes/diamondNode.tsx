import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface DiamondNodeData {
  id: string;
  label: string;
}

const DiamondNode: React.FC<NodeProps<DiamondNodeData>> = ({ data, isConnectable }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          width: 80,
          height: 80,
          backgroundColor: "white",
          color: "black",
          transform: "rotate(45deg)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid black",
        }}
      >
        <div style={{ transform: "rotate(-45deg)" }}>{data.label}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${data.id}.bottom`}
        style={{ borderRadius: "50%" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Left}
        id={`${data.id}.left`}
        style={{ borderRadius: "50%" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${data.id}.right`}
        style={{ borderRadius: "50%" }}
        isConnectable={isConnectable}
      />
    </>
  );
}
export default DiamondNode;
