import { Component } from "vue";

type ActionArea = Component<{ actions: Component[] }>;
export const useActionArea = () => {
  const ActionArea: ActionArea = ({ actions }) => (
    <div class="mb-2">{actions.map((action) => action)}</div>
  );
  return {
    ActionArea,
  };
};
