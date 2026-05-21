import { Chip } from "@mui/material";
import { categoryColour } from "shared";

export function CategoryChip({
  label,
  selected = false,
  onClick,
  size = "small",
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "small" | "medium";
}) {
  const colour = categoryColour(label);

  return (
    <Chip
      label={label}
      size={size}
      onClick={onClick}
      sx={{
        backgroundColor: selected ? colour : `${colour}28`,   // 28 ≈ 16% opacity
        color: selected ? '#fff' : colour,
        border: `1.5px solid ${colour}`,
        fontWeight: selected ? 700 : 500,
        borderRadius: '999px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        '&:hover': onClick ? {
          backgroundColor: `${colour}55`,
        } : {},
      }}
    />
  );
}