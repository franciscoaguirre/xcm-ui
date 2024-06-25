import { type Component } from 'solid-js';

export interface InstructionCardProps {
  onDelete: () => void;
}

export const InstructionCard: Component<InstructionCardProps> = (props) => {
  return (
    <div>
      Instruction
      <button onClick={props.onDelete}>Delete</button>
    </div>
  );
}
