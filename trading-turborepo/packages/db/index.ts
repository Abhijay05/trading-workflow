import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const EdgesSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const PositionSchema = new Schema(
  {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const NodeDataSchema = new Schema(
  {
    data: {
      kind: {
        type: String,
        enum: ["ACTION", "TRIGGER"],
      },

      metadata: Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const WorkflowNodesSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    position: PositionSchema,
    credentials: Schema.Types.Mixed,

    nodeId: {
      type: mongoose.Types.ObjectId,
      ref: "Nodes",
    },
    data: NodeDataSchema,
  },
  { _id: false }
);

const WorkflowSchema = new Schema({
  UserID: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  name: {
    type: String,
    default: "Untitled Workflow",
  },
  strategy: {
    type: String,
    enum: ["smart", "normal"],
    default: "normal",
  },
  dipThresholdPct: {
    type: Number,
  },
  volThresholdPct: {
    type: Number,
  },
  edges: [EdgesSchema],
  nodes: [WorkflowNodesSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const CredentialsTypeSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    required: true,
  },
});
const NodesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["ACTION", "TRIGGER"],
    required: true,
  },
  credentialsType: [CredentialsTypeSchema],
});
const ExecutionSchema = new Schema({
  workflowId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Workflows",
  },
  triggerNodeId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILURE"],
  },
  decision: {
    type: String,
    enum: ["BUY", "HEDGE", "IDLE"],
  },
  market: Schema.Types.Mixed,
  txHash: {
    type: String,
  },
  error: {
    type: String,
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  endTime: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export const UserModel = mongoose.model("Users", UserSchema);
export const WorkflowModel = mongoose.model("Workflows", WorkflowSchema);
export const NodesModel = mongoose.model("Nodes", NodesSchema);
export const ExecutionModel = mongoose.model("Executions", ExecutionSchema);
