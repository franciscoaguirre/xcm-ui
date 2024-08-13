import { Component, JSXElement } from "solid-js";

export interface SelectProps {
  children: JSXElement,
  setValue: (value: string) => void,
  label: string,
}

export const Select: Component<SelectProps> = (props) => {
  return (
    <div>
      <label>
        {props.label}: 
        <select onInput={(event) => props.setValue(event.currentTarget.value)}>
          {props.children}
        </select>
      </label>
    </div>
  );
}
