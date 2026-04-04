import {
  Sofa,
  BedDouble,
  UtensilsCrossed,
  Lamp,
  Package,
  Flower2,
  Bath,
  Monitor,
  TreePine,
  Layers,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'living-room': Sofa,
  bedroom: BedDouble,
  kitchen: UtensilsCrossed,
  lighting: Lamp,
  storage: Package,
  decor: Flower2,
  bathroom: Bath,
  office: Monitor,
  outdoor: TreePine,
  textiles: Layers,
};

export const DEFAULT_CATEGORY_ICON = Package;
export const ALL_CATEGORY_ICON = Layers;
