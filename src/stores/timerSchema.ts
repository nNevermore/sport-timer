import type { Phase } from "./types";

type BlockType = "phase" | "loop" | "sequence" | "wait";

interface BaseBlock {
  id: string;
  type: BlockType;
  name?: string;
}

interface PhaseBlock extends BaseBlock {
  type: "phase";
  phaseType: Phase;
  durationSec: number;
}

interface WaitBlock extends BaseBlock {
  type: "wait";
  phaseType: Phase; // Usually "rest" or "idle"
  // Wait blocks will count up until user interacts
}

interface LoopBlock extends BaseBlock {
  type: "loop";
  count: number;
  children: TimerBlock[];
}

interface SequenceBlock extends BaseBlock {
  type: "sequence";
  children: TimerBlock[];
}

export type TimerBlock = PhaseBlock | WaitBlock | LoopBlock | SequenceBlock;

interface CycleInfo {
  name: string;
  current: number;
  total: number;
}

export interface ExecutablePhase {
  id: string;
  blockId: string;
  phaseType: Phase;
  durationSec: number;
  name: string;
  isWait: boolean;
  cycleStack: CycleInfo[]; // Stack of cycles to show like "Cycle 1/8", "Set 1/4"
}

export function compileSchema(root: TimerBlock): ExecutablePhase[] {
  const result: ExecutablePhase[] = [];
  let phaseCounter = 0;

  function traverse(block: TimerBlock, currentCycles: CycleInfo[]) {
    if (block.type === "phase") {
      result.push({
        id: `exec_${phaseCounter++}`,
        blockId: block.id,
        phaseType: block.phaseType,
        durationSec: block.durationSec,
        name: block.name || block.phaseType,
        isWait: false,
        cycleStack: [...currentCycles],
      });
    } else if (block.type === "wait") {
      result.push({
        id: `exec_${phaseCounter++}`,
        blockId: block.id,
        phaseType: block.phaseType,
        durationSec: 0, // Wait blocks don't have a fixed duration
        name: block.name || "Wait",
        isWait: true,
        cycleStack: [...currentCycles],
      });
    } else if (block.type === "sequence") {
      for (const child of block.children) {
        traverse(child, currentCycles);
      }
    } else if (block.type === "loop") {
      for (let i = 1; i <= block.count; i++) {
        const loopInfo: CycleInfo = {
          name: block.name || "Loop",
          current: i,
          total: block.count,
        };
        for (const child of block.children) {
          traverse(child, [...currentCycles, loopInfo]);
        }
      }
    }
  }

  traverse(root, []);
  return result;
}

// Preset Builders
export function createDefaultSchema(
  warmup: number,
  work: number,
  rest: number,
  cycles: number,
  cooldown: number
): TimerBlock {
  const sequence: TimerBlock[] = [];

  if (warmup > 0) {
    sequence.push({
      id: "warmup",
      type: "phase",
      phaseType: "warmup",
      durationSec: warmup,
      name: "Warmup",
    });
  }

  if (cycles > 0) {
    sequence.push({
      id: "main_loop",
      type: "loop",
      count: cycles,
      name: "Cycle",
      children: [
        {
          id: "work",
          type: "phase",
          phaseType: "work",
          durationSec: work,
          name: "Work",
        },
        {
          id: "rest",
          type: "phase",
          phaseType: "rest",
          durationSec: rest,
          name: "Rest",
        },
      ],
    });
  }

  if (cooldown > 0) {
    sequence.push({
      id: "cooldown",
      type: "phase",
      phaseType: "cooldown",
      durationSec: cooldown,
      name: "Cooldown",
    });
  }

  return {
    id: "default_schema",
    type: "sequence",
    children: sequence,
  };
}

export function createSetsSchema(
  warmup: number,
  work: number,
  rest: number,
  cycles: number,
  sets: number,
  setRest: number,
  cooldown: number,
  useWaitBlockForSetRest: boolean
): TimerBlock {
  const sequence: TimerBlock[] = [];

  if (warmup > 0) {
    sequence.push({
      id: "warmup",
      type: "phase",
      phaseType: "warmup",
      durationSec: warmup,
      name: "Warmup",
    });
  }

  if (sets > 0) {
    sequence.push({
      id: "sets_loop",
      type: "loop",
      count: sets,
      name: "Set",
      children: [
        {
          id: "cycles_loop",
          type: "loop",
          count: cycles,
          name: "Cycle",
          children: [
            {
              id: "work",
              type: "phase",
              phaseType: "work",
              durationSec: work,
              name: "Work",
            },
            {
              id: "rest",
              type: "phase",
              phaseType: "rest",
              durationSec: rest,
              name: "Rest",
            },
          ],
        },
        useWaitBlockForSetRest
          ? {
              id: "set_rest_wait",
              type: "wait",
              phaseType: "rest",
              name: "Rest (Wait)",
            }
          : {
              id: "set_rest",
              type: "phase",
              phaseType: "rest",
              durationSec: setRest,
              name: "Set Rest",
            },
      ],
    });
  }

  if (cooldown > 0) {
    sequence.push({
      id: "cooldown",
      type: "phase",
      phaseType: "cooldown",
      durationSec: cooldown,
      name: "Cooldown",
    });
  }

  return {
    id: "sets_schema",
    type: "sequence",
    children: sequence,
  };
}
