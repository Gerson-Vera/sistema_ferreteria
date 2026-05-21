import type { SvgIconComponent } from '@mui/icons-material';
import AccountTreeIcon      from '@mui/icons-material/AccountTree';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon       from '@mui/icons-material/Assessment';
import AssignmentIcon       from '@mui/icons-material/Assignment';
import AutoGraphIcon        from '@mui/icons-material/AutoGraph';
import BarChartIcon         from '@mui/icons-material/BarChart';
import CompareArrowsIcon    from '@mui/icons-material/CompareArrows';
import DashboardIcon        from '@mui/icons-material/Dashboard';
import GroupsIcon           from '@mui/icons-material/Groups';
import Inventory2Icon       from '@mui/icons-material/Inventory2';
import LabelIcon            from '@mui/icons-material/Label';
import LocalShippingIcon    from '@mui/icons-material/LocalShipping';
import ManageAccountsIcon   from '@mui/icons-material/ManageAccounts';
import MenuBookIcon         from '@mui/icons-material/MenuBook';
import PendingActionsIcon   from '@mui/icons-material/PendingActions';
import PointOfSaleIcon      from '@mui/icons-material/PointOfSale';
import ReceiptIcon          from '@mui/icons-material/Receipt';
import ReceiptLongIcon      from '@mui/icons-material/ReceiptLong';
import ScaleIcon            from '@mui/icons-material/Scale';
import ShieldIcon           from '@mui/icons-material/Shield';
import ShoppingCartIcon     from '@mui/icons-material/ShoppingCart';
import SpeedIcon            from '@mui/icons-material/Speed';
import TuneIcon             from '@mui/icons-material/Tune';
import WarehouseIcon        from '@mui/icons-material/Warehouse';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import FolderIcon           from '@mui/icons-material/Folder';

export const ICON_MAP: Record<string, SvgIconComponent> = {
  AccountTree:        AccountTreeIcon,
  AdminPanelSettings: AdminPanelSettingsIcon,
  Assessment:         AssessmentIcon,
  Assignment:         AssignmentIcon,
  AutoGraph:          AutoGraphIcon,
  BarChart:           BarChartIcon,
  CompareArrows:      CompareArrowsIcon,
  Dashboard:          DashboardIcon,
  Groups:             GroupsIcon,
  Inventory:          Inventory2Icon,
  Inventory2:         Inventory2Icon,
  Label:              LabelIcon,
  LocalShipping:      LocalShippingIcon,
  ManageAccounts:     ManageAccountsIcon,
  MenuBook:           MenuBookIcon,
  PendingActions:     PendingActionsIcon,
  PointOfSale:        PointOfSaleIcon,
  Receipt:            ReceiptIcon,
  ReceiptLong:        ReceiptLongIcon,
  Scale:              ScaleIcon,
  Shield:             ShieldIcon,
  ShoppingCart:       ShoppingCartIcon,
  Speed:              SpeedIcon,
  Tune:               TuneIcon,
  Warehouse:          WarehouseIcon,
  WarningAmber:       WarningAmberIcon,
};

export function getIcon(name: string | null | undefined): SvgIconComponent {
  if (!name) return FolderIcon;
  return ICON_MAP[name] ?? FolderIcon;
}
