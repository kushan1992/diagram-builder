import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface CircleNodeData {
  id: string;
  label: string;
}

const CircleNode: React.FC<NodeProps<CircleNodeData>> = ({
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
          width: 100,
          height: 100,
          borderRadius: "50%",
          backgroundColor: "white",
          color: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid black",
        }}
      >
        {data.label}
      </div>
    </>
  );
};
export default CircleNode;
