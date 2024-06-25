import { XcmV4Instruction } from '@polkadot-api/descriptors';
import { createSignal, type Component, For, onMount } from 'solid-js';
import { InstructionCard } from './InstructionCard';

export const XcmWizard: Component = () => {
  const [availableInstructions, setAvailableInstructions] = createSignal<string[]>([]);
  const [chosenInstructions, setChosenInstructions] = createSignal<XcmV4Instruction[]>([]);

  onMount(() => {
    const allV4Instructions = Object.keys(XcmV4Instruction);
    console.dir({ instructions: XcmV4Instruction });
    setAvailableInstructions(allV4Instructions);
  });

  const addInstruction = () => {
    const newInstruction = XcmV4Instruction.ClearOrigin();
    setChosenInstructions((previous) => [...previous, newInstruction]);
  };

  const handleDelete = (index: number) => {
    const newInstructions = chosenInstructions();
    newInstructions.splice(index, 1);
    setChosenInstructions([...newInstructions]);
  };

  return (
    <div style="display: flex;">
      <aside>
        <input placeholder="Search instructions"></input>
        <For each={availableInstructions()}>{(instruction) =>
          <button onClick={addInstruction}>{instruction}</button>
        }</For>
      </aside>
      <main style="width: 100%; display: flex; flex-direction: column; align-items: center;">
        <For each={chosenInstructions()}>{(instruction, index) =>
          <InstructionCard onDelete={() => handleDelete(index())} />
        }</For>
      </main>
    </div>
  );
}
